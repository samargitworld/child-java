import { CloudLabCommitDTO } from "./cloud-lab-commit-dto";
import { SessionEventDTO } from "./session-event-dto";
import { TestCaseLogDTO } from "./test-case-log-dto";

export class CloudLabRequestDTO {
  revproWorkspaceId!: number;
  gitpodWorkspaceId!: string;
  projectCode!: string;
  cloudLabCommitDetailsDTO!: CloudLabCommitDTO;
  cloudLabSessionDetailsDTO!: SessionEventDTO[];
  cloudLabTestcasesDTO!: TestCaseLogDTO;
  cloudLabSessionDataId!: number;
}
