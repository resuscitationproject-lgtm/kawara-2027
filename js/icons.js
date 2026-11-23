const paths = {
  mountain:
    '<path d="m2 19 8-13 5 8 3-5 5 10H2Z"/><path d="m7.3 10.4 2.7 2.3 2.4-2"/>',
  shrine:
    '<path d="M2 4c7 2 13 2 20 0M3 8h18M5 12h14M8 8 6 21m10-13 2 13M12 8v4"/>',
  bowl: '<path d="M2 12h20c-1 5-4 8-10 8S3 17 2 12Zm7 9h6M6 9c-2-3 3-3 1-6m4 6c-2-3 3-3 1-6m4 6c-2-2 3-3 2-5"/>',
  train:
    '<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 7h14m-14 6h14m-7-6v6M8 19l-3 3m11-3 3 3"/><circle cx="8.5" cy="16" r=".7"/><circle cx="15.5" cy="16" r=".7"/>',
  camera: '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
  book: '<path d="M12 5C8 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1Zm0 0v15"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5m10-5v5M3 11h18"/>',
  stamp:
    '<path d="M4 17h16v4H4zM7 17c0-3 4-3 3-6L9 8a3 3 0 1 1 6 0l-1 3c-1 3 3 3 3 6"/>',
  save: '<path d="M12 2v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
};
export function icon(name) {
  return (
    '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round">' +
    paths[name] +
    "</svg>"
  );
}
