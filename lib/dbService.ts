import { User, Wallet, ExpenseCategory, IncomeCategory, Transaction, Debt, SavingsGoal } from './types';

export interface HydratedUserData {
  user: User;
  wallets: Wallet[];
  expenseCategories: ExpenseCategory[];
  incomeCategories: IncomeCategory[];
  transactions: Transaction[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
}

export async function fetchUserData(email: string): Promise<HydratedUserData | null> {
  try {
    const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    return {
      user: {
        id: json.data.id,
        name: json.data.name,
        email: json.data.email,
        avatar: json.data.avatar,
        plan: json.data.plan,
        tier: json.data.plan,
        memberSince: json.data.memberSince,
      },
      wallets: json.data.wallets ?? [],
      expenseCategories: json.data.expenseCategories ?? [],
      incomeCategories: json.data.incomeCategories ?? [],
      transactions: json.data.transactions ?? [],
      debts: json.data.debts ?? [],
      savingsGoals: json.data.savingsGoals ?? [],
    };
  } catch {
    return null;
  }
}

export async function apiAddTransaction(
  tx: Omit<Transaction, 'id'>,
  userEmail: string
): Promise<Transaction | null> {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tx, email: userEmail }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiUpdateTransaction(
  id: string,
  tx: Omit<Transaction, 'id'>
): Promise<Transaction | null> {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiDeleteTransaction(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiAddWallet(
  wallet: Omit<Wallet, 'id'>,
  userEmail: string
): Promise<{ success: boolean; data?: Wallet; error?: string }> {
  try {
    const res = await fetch('/api/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...wallet, email: userEmail }),
    });
    const json = await res.json();
    return json;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function apiDeleteWallet(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiAddCategory(
  category: Omit<ExpenseCategory, 'id'>,
  userEmail: string
): Promise<{ success: boolean; data?: ExpenseCategory; error?: string }> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...category, email: userEmail }),
    });
    const json = await res.json();
    return json;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function apiUpdateCategory(
  id: string,
  category: Partial<ExpenseCategory>
): Promise<{ success: boolean; data?: ExpenseCategory; error?: string }> {
  try {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    const json = await res.json();
    return json;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function apiBulkSaveCategories(
  categories: ExpenseCategory[],
  userEmail: string,
  replaceExisting = false
): Promise<{ success: boolean; data?: ExpenseCategory[]; error?: string }> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories, email: userEmail, replaceExisting }),
    });
    const json = await res.json();
    return json;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function apiDeleteCategory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiAddDebt(
  debt: Omit<Debt, 'id' | 'createdAt' | 'status'>,
  userEmail: string
): Promise<Debt | null> {
  try {
    const res = await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...debt, email: userEmail }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiDeleteDebt(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiPayDebt(
  debtId: string,
  amount: number,
  walletId: string,
  isFullPayment: boolean,
  userEmail: string
): Promise<{ debt: Debt; transaction: Transaction } | null> {
  try {
    const res = await fetch(`/api/debts/${debtId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, walletId, isFullPayment, email: userEmail }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiAddSavingsGoal(
  goal: Omit<SavingsGoal, 'id'>,
  userEmail: string
): Promise<SavingsGoal | null> {
  try {
    const res = await fetch('/api/savings-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...goal, email: userEmail }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiUpdateSavingsGoal(
  id: string,
  goal: Partial<SavingsGoal>
): Promise<SavingsGoal | null> {
  try {
    const res = await fetch(`/api/savings-goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiDeleteSavingsGoal(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/savings-goals/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiDepositSavingsGoal(
  goalId: string,
  amount: number,
  walletId: string,
  userEmail: string
): Promise<{ goal: SavingsGoal; wallet: Wallet; transaction: Transaction } | null> {
  try {
    const res = await fetch(`/api/savings-goals/${goalId}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, walletId, email: userEmail }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiWithdrawSavingsGoal(
  goalId: string,
  amount: number,
  walletId: string,
  userEmail: string
): Promise<{ goal: SavingsGoal; wallet: Wallet; transaction: Transaction } | null> {
  try {
    const res = await fetch(`/api/savings-goals/${goalId}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, walletId, email: userEmail }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function apiSyncDatabase(payload: any): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
