export function getBackendOrigin(): string {
  const { protocol, hostname, origin, port } = window.location;

  if (port === "5001") {
    return origin;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:5001`;
  }

  return origin;
}

export function goToBackendAuthPath(path: string): void {
  window.location.href = `${getBackendOrigin()}${path}`;
}