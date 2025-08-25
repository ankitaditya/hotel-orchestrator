/**
 * Temporal Client Service - Workflow orchestration client
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Temporal.io client for orchestrating hotel comparison workflows
 */

import { Client } from '@temporalio/client';
import { hotelComparisonWorkflow, healthCheckWorkflow } from '../temporal/workflows';
import { DeduplicatedHotel } from '../types/hotel';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!client) {
    client = new Client({
      // Use default connection to local Temporal server
      // In production, you would configure this properly
    });
  }
  return client;
}

export async function executeHotelComparison(city: string): Promise<DeduplicatedHotel[]> {
  const temporalClient = await getTemporalClient();
  
  const workflowId = `hotel-comparison-${city}-${Date.now()}`;
  
  const handle = await temporalClient.workflow.start(hotelComparisonWorkflow, {
    args: [city],
    taskQueue: 'hotel-orchestrator',
    workflowId,
  });

  return await handle.result();
}

export async function executeHealthCheck(): Promise<{ supplierA: boolean; supplierB: boolean }> {
  const temporalClient = await getTemporalClient();
  
  const workflowId = `health-check-${Date.now()}`;
  
  const handle = await temporalClient.workflow.start(healthCheckWorkflow, {
    args: [],
    taskQueue: 'hotel-orchestrator',
    workflowId,
  });

  return await handle.result();
}