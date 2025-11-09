const API_URLS = {
  auth: 'https://functions.poehali.dev/4efd73f4-1587-4eb2-aeb5-e3a750db2892',
  transactions: 'https://functions.poehali.dev/9de59063-cacc-41f0-9053-481babfc559c',
  support: 'https://functions.poehali.dev/7217c844-8ba1-4495-acf9-54705856d76c',
};

export const api = {
  async authenticateWithTelegram(telegramData: any) {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_data: telegramData }),
    });
    return response.json();
  },

  async getTransactions(userId: number) {
    const response = await fetch(`${API_URLS.transactions}?user_id=${userId}`);
    return response.json();
  },

  async createTransaction(data: {
    user_id: number;
    type: string;
    amount?: number;
    steam_login?: string;
    region?: string;
  }) {
    const response = await fetch(API_URLS.transactions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getSupportMessages(userId: number) {
    const response = await fetch(`${API_URLS.support}?user_id=${userId}`);
    return response.json();
  },

  async sendSupportMessage(userId: number, message: string) {
    const response = await fetch(API_URLS.support, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message }),
    });
    return response.json();
  },
};
