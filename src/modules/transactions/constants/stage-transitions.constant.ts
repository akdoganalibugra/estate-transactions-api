import { TransactionStage } from '../enums/transaction-stage.enum';

export const ALLOWED_TRANSITIONS: Record<TransactionStage, TransactionStage[]> = {
    [TransactionStage.AGREEMENT]: [TransactionStage.EARNEST_MONEY, TransactionStage.CANCELED],
    [TransactionStage.EARNEST_MONEY]: [TransactionStage.TITLE_DEED, TransactionStage.CANCELED],
    [TransactionStage.TITLE_DEED]: [TransactionStage.COMPLETED, TransactionStage.CANCELED],
    [TransactionStage.COMPLETED]: [],
    [TransactionStage.CANCELED]: [],
};
