import type { FindingStatus } from '../intel/schema';
import { STATUS_HELP, STATUS_LABEL } from '../intel/status';

/** Insignia de estado editorial de ATLAS INTELLIGENCE: texto + punto; el color nunca es la única señal. */
export function StatusBadge({ status }: { status: FindingStatus }) {
  return (
    <span className={`badge intel-${status}`} title={STATUS_HELP[status]}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
      <span className="sr-only">. {STATUS_HELP[status]}</span>
    </span>
  );
}
