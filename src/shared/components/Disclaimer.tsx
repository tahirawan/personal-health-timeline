import { ui } from '../lib/uiStyles';

export function Disclaimer() {
  return (
    <aside className={ui.disclaimer}>
      This app records health readings only and does not provide medical advice. Always consult a
      qualified healthcare professional for medical concerns.
    </aside>
  );
}
