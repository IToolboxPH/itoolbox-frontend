/**
 * Reads a text/event-stream response body and hands each event's data, parsed
 * as JSON, to onEvent.
 *
 * EventSource can't be used here: it only issues GET requests and can't send
 * the Authorization header, and POST /api/v1/agent/ask needs both.
 */
export async function readEventStream<T>(response: Response, onEvent: (event: T) => void): Promise<void> {
  if (!response.body) throw new Error("The server sent no stream");
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value.replace(/\r\n/g, "\n");

    // Events are separated by a blank line. Comment lines (": keep-alive") carry
    // no data and are dropped.
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = block
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (data) onEvent(JSON.parse(data) as T);
    }
  }
}
