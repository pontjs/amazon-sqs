/**
 * @author pontx-generator
 * @description Generated Amazon SQS action facade. Do not edit by hand.
 */

import {
  AddPermissionCommand,
  type AddPermissionCommandInput,
  type AddPermissionCommandOutput,
  CancelMessageMoveTaskCommand,
  type CancelMessageMoveTaskCommandInput,
  type CancelMessageMoveTaskCommandOutput,
  ChangeMessageVisibilityCommand,
  type ChangeMessageVisibilityCommandInput,
  type ChangeMessageVisibilityCommandOutput,
  ChangeMessageVisibilityBatchCommand,
  type ChangeMessageVisibilityBatchCommandInput,
  type ChangeMessageVisibilityBatchCommandOutput,
  CreateQueueCommand,
  type CreateQueueCommandInput,
  type CreateQueueCommandOutput,
  DeleteMessageCommand,
  type DeleteMessageCommandInput,
  type DeleteMessageCommandOutput,
  DeleteMessageBatchCommand,
  type DeleteMessageBatchCommandInput,
  type DeleteMessageBatchCommandOutput,
  DeleteQueueCommand,
  type DeleteQueueCommandInput,
  type DeleteQueueCommandOutput,
  GetQueueAttributesCommand,
  type GetQueueAttributesCommandInput,
  type GetQueueAttributesCommandOutput,
  GetQueueUrlCommand,
  type GetQueueUrlCommandInput,
  type GetQueueUrlCommandOutput,
  ListDeadLetterSourceQueuesCommand,
  type ListDeadLetterSourceQueuesCommandInput,
  type ListDeadLetterSourceQueuesCommandOutput,
  ListMessageMoveTasksCommand,
  type ListMessageMoveTasksCommandInput,
  type ListMessageMoveTasksCommandOutput,
  ListQueueTagsCommand,
  type ListQueueTagsCommandInput,
  type ListQueueTagsCommandOutput,
  ListQueuesCommand,
  type ListQueuesCommandInput,
  type ListQueuesCommandOutput,
  PurgeQueueCommand,
  type PurgeQueueCommandInput,
  type PurgeQueueCommandOutput,
  ReceiveMessageCommand,
  type ReceiveMessageCommandInput,
  type ReceiveMessageCommandOutput,
  RemovePermissionCommand,
  type RemovePermissionCommandInput,
  type RemovePermissionCommandOutput,
  SendMessageCommand,
  type SendMessageCommandInput,
  type SendMessageCommandOutput,
  SendMessageBatchCommand,
  type SendMessageBatchCommandInput,
  type SendMessageBatchCommandOutput,
  SetQueueAttributesCommand,
  type SetQueueAttributesCommandInput,
  type SetQueueAttributesCommandOutput,
  StartMessageMoveTaskCommand,
  type StartMessageMoveTaskCommandInput,
  type StartMessageMoveTaskCommandOutput,
  TagQueueCommand,
  type TagQueueCommandInput,
  type TagQueueCommandOutput,
  UntagQueueCommand,
  type UntagQueueCommandInput,
  type UntagQueueCommandOutput,
} from "@aws-sdk/client-sqs";
import type { SQSClient } from "@aws-sdk/client-sqs";

export const amazonSqsActionNames = [
  "AddPermission",
  "CancelMessageMoveTask",
  "ChangeMessageVisibility",
  "ChangeMessageVisibilityBatch",
  "CreateQueue",
  "DeleteMessage",
  "DeleteMessageBatch",
  "DeleteQueue",
  "GetQueueAttributes",
  "GetQueueUrl",
  "ListDeadLetterSourceQueues",
  "ListMessageMoveTasks",
  "ListQueueTags",
  "ListQueues",
  "PurgeQueue",
  "ReceiveMessage",
  "RemovePermission",
  "SendMessage",
  "SendMessageBatch",
  "SetQueueAttributes",
  "StartMessageMoveTask",
  "TagQueue",
  "UntagQueue"
] as const;
export type AmazonSqsActionName = typeof amazonSqsActionNames[number];

export type AmazonSqsActions = {
  addPermission(input: AddPermissionCommandInput): Promise<AddPermissionCommandOutput>;
  cancelMessageMoveTask(input: CancelMessageMoveTaskCommandInput): Promise<CancelMessageMoveTaskCommandOutput>;
  changeMessageVisibility(input: ChangeMessageVisibilityCommandInput): Promise<ChangeMessageVisibilityCommandOutput>;
  changeMessageVisibilityBatch(input: ChangeMessageVisibilityBatchCommandInput): Promise<ChangeMessageVisibilityBatchCommandOutput>;
  createQueue(input: CreateQueueCommandInput): Promise<CreateQueueCommandOutput>;
  deleteMessage(input: DeleteMessageCommandInput): Promise<DeleteMessageCommandOutput>;
  deleteMessageBatch(input: DeleteMessageBatchCommandInput): Promise<DeleteMessageBatchCommandOutput>;
  deleteQueue(input: DeleteQueueCommandInput): Promise<DeleteQueueCommandOutput>;
  getQueueAttributes(input: GetQueueAttributesCommandInput): Promise<GetQueueAttributesCommandOutput>;
  getQueueUrl(input: GetQueueUrlCommandInput): Promise<GetQueueUrlCommandOutput>;
  listDeadLetterSourceQueues(input: ListDeadLetterSourceQueuesCommandInput): Promise<ListDeadLetterSourceQueuesCommandOutput>;
  listMessageMoveTasks(input: ListMessageMoveTasksCommandInput): Promise<ListMessageMoveTasksCommandOutput>;
  listQueueTags(input: ListQueueTagsCommandInput): Promise<ListQueueTagsCommandOutput>;
  listQueues(input: ListQueuesCommandInput): Promise<ListQueuesCommandOutput>;
  purgeQueue(input: PurgeQueueCommandInput): Promise<PurgeQueueCommandOutput>;
  receiveMessage(input: ReceiveMessageCommandInput): Promise<ReceiveMessageCommandOutput>;
  removePermission(input: RemovePermissionCommandInput): Promise<RemovePermissionCommandOutput>;
  sendMessage(input: SendMessageCommandInput): Promise<SendMessageCommandOutput>;
  sendMessageBatch(input: SendMessageBatchCommandInput): Promise<SendMessageBatchCommandOutput>;
  setQueueAttributes(input: SetQueueAttributesCommandInput): Promise<SetQueueAttributesCommandOutput>;
  startMessageMoveTask(input: StartMessageMoveTaskCommandInput): Promise<StartMessageMoveTaskCommandOutput>;
  tagQueue(input: TagQueueCommandInput): Promise<TagQueueCommandOutput>;
  untagQueue(input: UntagQueueCommandInput): Promise<UntagQueueCommandOutput>;
};

export function createAmazonSqsActions(client: SQSClient): AmazonSqsActions {
  return {
  addPermission: (input) => client.send(new AddPermissionCommand(input)),
  cancelMessageMoveTask: (input) => client.send(new CancelMessageMoveTaskCommand(input)),
  changeMessageVisibility: (input) => client.send(new ChangeMessageVisibilityCommand(input)),
  changeMessageVisibilityBatch: (input) => client.send(new ChangeMessageVisibilityBatchCommand(input)),
  createQueue: (input) => client.send(new CreateQueueCommand(input)),
  deleteMessage: (input) => client.send(new DeleteMessageCommand(input)),
  deleteMessageBatch: (input) => client.send(new DeleteMessageBatchCommand(input)),
  deleteQueue: (input) => client.send(new DeleteQueueCommand(input)),
  getQueueAttributes: (input) => client.send(new GetQueueAttributesCommand(input)),
  getQueueUrl: (input) => client.send(new GetQueueUrlCommand(input)),
  listDeadLetterSourceQueues: (input) => client.send(new ListDeadLetterSourceQueuesCommand(input)),
  listMessageMoveTasks: (input) => client.send(new ListMessageMoveTasksCommand(input)),
  listQueueTags: (input) => client.send(new ListQueueTagsCommand(input)),
  listQueues: (input) => client.send(new ListQueuesCommand(input)),
  purgeQueue: (input) => client.send(new PurgeQueueCommand(input)),
  receiveMessage: (input) => client.send(new ReceiveMessageCommand(input)),
  removePermission: (input) => client.send(new RemovePermissionCommand(input)),
  sendMessage: (input) => client.send(new SendMessageCommand(input)),
  sendMessageBatch: (input) => client.send(new SendMessageBatchCommand(input)),
  setQueueAttributes: (input) => client.send(new SetQueueAttributesCommand(input)),
  startMessageMoveTask: (input) => client.send(new StartMessageMoveTaskCommand(input)),
  tagQueue: (input) => client.send(new TagQueueCommand(input)),
  untagQueue: (input) => client.send(new UntagQueueCommand(input)),
  };
}
