import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insufficient balance for this transaction', 400);
    }

    let findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(findCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: findCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
