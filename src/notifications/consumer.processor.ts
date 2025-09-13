import { Processor, WorkerHost } from '@nestjs/bullmq';

@Processor('email')
export class EmailConsumer extends WorkerHost {
  async process(job: any) {
    console.log('Processing email job:', job.data);
    // هنا تبعت ايميل فعلي أو simulation
  }
}
