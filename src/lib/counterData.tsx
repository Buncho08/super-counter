type Listener = (value: number) => void;

const listeners = new Set<Listener>();
let currentValue = 0;
let ws: WebSocket | null = null;

function notify(value: number): void {
  currentValue = value;
  listeners.forEach((cb) => cb(value));
}

// --- WebSocket でリアルタイム同期 ---
function connectWs(): void {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // API サーバー（ポート 3001）に直接 WebSocket 接続
  const wsUrl = `${protocol}//${window.location.hostname}:3001`;

  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (typeof msg.value === 'number') {
        notify(msg.value);
      }
    } catch {
      // ignore
    }
  };

  ws.onclose = () => {
    // 自動再接続（2 秒後）
    setTimeout(connectWs, 2000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

// 初回データ取得 + WebSocket 接続
const initPromise: Promise<void> = (async () => {
  try {
    const res = await fetch('/api/counter');
    const json = await res.json();
    if (typeof json.value === 'number') {
      notify(json.value);
    }
  } catch (e) {
    console.error('[counterData] init fetch error:', e);
  }
  connectWs();
})();

export const openLinkInNewTab = (href: string): void => {
  const $a = document.createElement('a');
  $a.setAttribute('href', href);
  $a.setAttribute('target', '_blank');
  $a.setAttribute('rel', 'noopener noreferrer');
  document.body.appendChild($a);
  $a.click();
  document.body.removeChild($a);
};

/**
 * カウンターを +1 する
 */
export async function increment(): Promise<void> {
  await initPromise;
  try {
    const res = await fetch('/api/counter/inc', { method: 'POST' });
    const json = await res.json();
    if (typeof json.value === 'number') {
      notify(json.value);
    }
  } catch (e) {
    console.error('[counterData] increment error:', e);
  }
}

/**
 * カウンターを -1 する（0 未満にはならない）
 */
export async function decrement(): Promise<void> {
  await initPromise;
  try {
    const res = await fetch('/api/counter/dec', { method: 'POST' });
    const json = await res.json();
    if (typeof json.value === 'number') {
      notify(json.value);
    }
  } catch (e) {
    console.error('[counterData] decrement error:', e);
  }
}

/**
 * 値が変わったときに呼ばれるコールバックを登録する。
 * 戻り値は登録解除関数。
 */
export function onChange(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * 現在のカウンター値を同期的に返す（最後に受信した値）。
 */
export function getCountSync(): number {
  return currentValue;
}

/**
 * WebSocket を切断する（テスト・クリーンアップ用）。
 */
export function destroy(): void {
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  currentValue = 0;
  listeners.clear();
}