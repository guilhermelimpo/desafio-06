import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parse';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  csvFileName: string;
}

interface DataRowParsed {
  title: string;
  type: 'income' | 'outcome';
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFileName }: RequestDTO): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, csvFileName);
    const csvStream = fs.createReadStream(csvFilePath);
    const parser = csvStream.pipe(
      csvParser({ columns: true, from_line: 1, trim: true }),
    );

    const dataRows: DataRowParsed[] = [];

    parser.on('data', async (data: DataRowParsed) => {
      // const { title, type, value, category } = data;
      dataRows.push(data);

      // console.log(transaction);
      // transactions.push(transaction);
      // console.log(transactions);
    }),
      await new Promise(resolve => parser.on('end', resolve));

    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    for (const dataRow of dataRows) {
      const { title, type, value, category } = dataRow;
      const transaction = await createTransaction.execute({
        title,
        type,
        value: parseFloat(value),
        category,
      });
      transactions.push(transaction);
    }

    // await fs.promises.unlink(csvFilePath);
    console.log(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
