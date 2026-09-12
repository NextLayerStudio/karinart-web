export const TEST_ACCOUNT_EMAIL = 'vasekdenis@outlook.com';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isTestAccountEmail(email: string): boolean {
  return normalizeEmail(email) === TEST_ACCOUNT_EMAIL;
}

export function isTestCustomer(customer: {
  isTestAccount?: boolean;
  email?: string;
}): boolean {
  return Boolean(customer.isTestAccount) || isTestAccountEmail(customer.email ?? '');
}

export const excludeTestCustomersWhere = { isTestAccount: false } as const;

export function shouldSkipInternalNotice(customerEmail?: string | null): boolean {
  return customerEmail ? isTestAccountEmail(customerEmail) : false;
}

export async function getTestCustomerIds(prisma: {
  customer: {
    findMany: (args: {
      where: { isTestAccount: boolean };
      select: { id: true };
    }) => Promise<{ id: string }[]>;
  };
}): Promise<Set<string>> {
  const testCustomers = await prisma.customer.findMany({
    where: { isTestAccount: true },
    select: { id: true },
  });

  return new Set(testCustomers.map((customer) => customer.id));
}
