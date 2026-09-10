
export interface Job {
  id: string;
  type: 'RDA_SEND' | 'PHARMACY_DISPENSE';
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
}

// Mock of an in-memory queue
const jobQueue: Map<string, Job> = new Map();

export async function enqueueJob(type: Job['type'], payload: any) {
  const jobId = crypto.randomUUID();
  const job: Job = {
    id: jobId,
    type,
    payload,
    status: 'pending',
    attempts: 0
  };
  jobQueue.set(jobId, job);
  
  // Simulate asynchronous background processing
  setTimeout(async () => {
    const currentJob = jobQueue.get(jobId);
    if (currentJob) {
      currentJob.status = 'processing';
      // In real scenario: call the actual Ministry API here
      console.log(`[Worker] Processing ${type} job ${jobId}...`);
      currentJob.status = 'completed';
    }
  }, 2000);

  return jobId;
}

export async function getJobStatus(jobId: string) {
  return jobQueue.get(jobId);
}
