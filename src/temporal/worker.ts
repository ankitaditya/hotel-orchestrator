/**
 * Temporal Worker - Workflow execution engine
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Temporal.io worker for executing hotel comparison workflows
 */

import { Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'hotel-orchestrator',
  });

  console.log('Temporal worker started, listening on task queue: hotel-orchestrator');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});