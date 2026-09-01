// ==========================================
// FinTwin Financial Data Store (User-Linked & Backend Synced)
// ==========================================

import { cleanBusiness, demoPresets } from "./sampleData";
import { API_URL } from "../config";

let activeUserId = null;
let activeBusinessId = null;

let financialData = {
  business: { ...cleanBusiness },
  customers: [],
  invoices: [],
  payments: [],
  recurringExpenses: [],
  expenses: [],
  workers: [],
  payrollDisbursements: [],
};

let databaseConnected = false;
const subscribers = new Set();

export function subscribeFinancialData(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function notifySubscribers() {
  if (activeUserId) {
    try {
      localStorage.setItem(`fintwin_userdata_${activeUserId}`, JSON.stringify(financialData));
    } catch (e) {
      console.warn("Could not save to user localStorage:", e);
    }
  }

  subscribers.forEach((callback) => {
    try {
      callback(getFinancialData());
    } catch (error) {
      console.error("Financial store subscriber error:", error);
    }
  });
}

// ==========================================
// USER SESSION INITIALIZATION & PERSISTENCE
// ==========================================

export function initUserSession(user) {
  if (!user) return;
  activeUserId = user.id;
  activeBusinessId = user.businessId || "BUS-001";

  // 1. Try loading cached user-specific data from localStorage
  try {
    const cached = localStorage.getItem(`fintwin_userdata_${activeUserId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      financialData = {
        business: {
          ...cleanBusiness,
          id: activeBusinessId,
          name: user.company || parsed.business?.name || "My Enterprise",
          gstin: user.gstin || parsed.business?.gstin || "",
          ...parsed.business,
        },
        customers: parsed.customers || [],
        invoices: parsed.invoices || [],
        payments: parsed.payments || [],
        recurringExpenses: parsed.recurringExpenses || [],
        expenses: parsed.expenses || [],
        workers: parsed.workers || [],
        payrollDisbursements: parsed.payrollDisbursements || [],
      };
    } else {
      // Clean slate for newly registered user
      financialData = {
        business: {
          ...cleanBusiness,
          id: activeBusinessId,
          name: user.company || "My Enterprise",
          gstin: user.gstin || "",
        },
        customers: [],
        invoices: [],
        payments: [],
        recurringExpenses: [],
        expenses: [],
        workers: [],
        payrollDisbursements: [],
      };
    }
  } catch (e) {
    console.warn("Error restoring user session data:", e);
  }

  notifySubscribers();

  // 2. Sync with remote backend database
  syncWithBackendDatabase();
}

export function clearActiveSession() {
  activeUserId = null;
  activeBusinessId = null;

  financialData = {
    business: { ...cleanBusiness },
    customers: [],
    invoices: [],
    payments: [],
    recurringExpenses: [],
    expenses: [],
    workers: [],
    payrollDisbursements: [],
  };

  notifySubscribers();
}

export function isDatabaseConnected() {
  return databaseConnected;
}

export function getFinancialData() {
  return {
    business: { ...financialData.business },
    customers: [...financialData.customers],
    invoices: [...financialData.invoices],
    payments: [...financialData.payments],
    recurringExpenses: [...financialData.recurringExpenses],
    expenses: [...financialData.expenses],
    workers: [...(financialData.workers || [])],
    payrollDisbursements: [...(financialData.payrollDisbursements || [])],
  };
}

export function getBusiness() {
  return { ...financialData.business };
}

export function getCustomers() {
  return [...financialData.customers];
}

export function getInvoices() {
  return [...financialData.invoices];
}

export function getPayments() {
  return [...financialData.payments];
}

export function getRecurringExpenses() {
  return [...financialData.recurringExpenses];
}

export function getExpenses() {
  return [...financialData.expenses];
}

// ==========================================
// BUSINESS PROFILE ACTIONS
// ==========================================

export function updateBusinessProfile(updated) {
  financialData.business = {
    ...financialData.business,
    ...updated,
    id: activeBusinessId || financialData.business.id || "BUS-001",
  };
  notifySubscribers();

  // Persist to backend database
  fetch(`${API_URL}/api/business`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: financialData.business.id,
      name: financialData.business.name,
      industry: financialData.business.industry,
      gstin: financialData.business.gstin,
      currency: financialData.business.currency,
      openingCash: Number(financialData.business.openingCash || 0),
      monthlyRevenue: Number(financialData.business.monthlyRevenue || 0),
      monthlyExpenses: Number(financialData.business.monthlyExpenses || 0),
    }),
  }).catch((err) => console.warn("Backend business sync error:", err));
}

// ==========================================
// INVOICE ACTIONS
// ==========================================

export function createInvoices(newInvoices) {
  const bizId = activeBusinessId || financialData.business.id || "BUS-001";
  const normalized = (Array.isArray(newInvoices) ? newInvoices : [newInvoices]).map((inv) => ({
    ...inv,
    businessId: bizId,
  }));

  financialData.invoices = [...normalized, ...financialData.invoices];

  // Auto-register new customers
  normalized.forEach((inv) => {
    if (inv.customer && !financialData.customers.some((c) => c.name === inv.customer)) {
      financialData.customers.push({
        id: inv.customerId || `CUS-${financialData.customers.length + 1}`,
        businessId: bizId,
        name: inv.customer,
        industry: "Client Account",
        contactEmail: "",
        creditScore: "Medium Risk",
        paymentTermsDays: 30,
        avgDelayDays: inv.predictedDelayDays || 5,
      });
    }
  });

  notifySubscribers();

  // Persist bulk invoices to backend database
  fetch(`${API_URL}/api/invoices/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      normalized.map((inv) => ({
        id: inv.id,
        businessId: bizId,
        customerId: inv.customerId || `CUS-${Math.floor(100 + Math.random() * 900)}`,
        customer: inv.customer,
        amount: Number(inv.amount || 0),
        invoiceDate: inv.invoiceDate || new Date().toISOString().slice(0, 10),
        dueDate: inv.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: inv.status || "Pending",
        paymentDate: inv.paymentDate || null,
        source: inv.source || "file_upload",
      }))
    ),
  }).catch((err) => console.warn("Backend bulk invoice sync error:", err));
}

export function addInvoice(invoice) {
  const bizId = activeBusinessId || financialData.business.id || "BUS-001";
  const newInvoice = {
    id: invoice.id || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    businessId: bizId,
    customerId: invoice.customerId || `CUS-${financialData.customers.length + 1}`,
    customer: invoice.customer || "General Client",
    amount: Number(invoice.amount) || 0,
    invoiceDate: invoice.invoiceDate || new Date().toISOString().slice(0, 10),
    dueDate: invoice.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: invoice.status || "Pending",
    predictedDelayDays: Number(invoice.predictedDelayDays) || 5,
    riskScore: invoice.riskScore || "Medium",
    paymentDate: invoice.status === "Paid" ? new Date().toISOString().slice(0, 10) : null,
    source: invoice.source || "user_upload",
  };

  createInvoices([newInvoice]);
  return newInvoice;
}

export function updateInvoiceStatus(invoiceId, newStatus) {
  financialData.invoices = financialData.invoices.map((inv) => {
    if (inv.id === invoiceId) {
      const isPaid = newStatus === "Paid";
      const updated = {
        ...inv,
        status: newStatus,
        paymentDate: isPaid ? new Date().toISOString().slice(0, 10) : null,
      };

      // Persist to backend
      fetch(`${API_URL}/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentDate: updated.paymentDate,
        }),
      }).catch((err) => console.warn("Backend invoice update error:", err));

      return updated;
    }
    return inv;
  });
  notifySubscribers();
}

export function deleteInvoice(invoiceId) {
  financialData.invoices = financialData.invoices.filter((i) => i.id !== invoiceId);
  notifySubscribers();

  fetch(`${API_URL}/api/invoices/${invoiceId}`, {
    method: "DELETE",
  }).catch((err) => console.warn("Backend invoice delete error:", err));
}

// ==========================================
// EXPENSE ACTIONS
// ==========================================

export function addExpense(expense) {
  const bizId = activeBusinessId || financialData.business.id || "BUS-001";
  const isRec = Boolean(expense.recurring);

  if (isRec) {
    const newRec = {
      id: expense.id || `REC-${Math.floor(100 + Math.random() * 900)}`,
      businessId: bizId,
      category: expense.category || "General",
      description: expense.description || "Recurring Expense",
      amount: Number(expense.amount) || 0,
      frequency: expense.frequency || "Monthly",
      dayOfMonth: Number(expense.dayOfMonth) || 1,
      source: "user_entry",
    };
    financialData.recurringExpenses = [newRec, ...financialData.recurringExpenses];

    fetch(`${API_URL}/api/recurring-expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRec),
    }).catch((err) => console.warn("Backend recurring expense error:", err));
  } else {
    const newExp = {
      id: expense.id || `EXP-${Math.floor(100 + Math.random() * 900)}`,
      businessId: bizId,
      category: expense.category || "General",
      description: expense.description || "One-time Expense",
      amount: Number(expense.amount) || 0,
      date: expense.date || new Date().toISOString().slice(0, 10),
      recurring: false,
      source: "user_entry",
    };
    financialData.expenses = [newExp, ...financialData.expenses];

    fetch(`${API_URL}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExp),
    }).catch((err) => console.warn("Backend expense error:", err));
  }
  notifySubscribers();
}

export function deleteExpense(id, isRecurring = false) {
  if (isRecurring) {
    financialData.recurringExpenses = financialData.recurringExpenses.filter((e) => e.id !== id);
    fetch(`${API_URL}/api/recurring-expenses/${id}`, { method: "DELETE" }).catch(() => {});
  } else {
    financialData.expenses = financialData.expenses.filter((e) => e.id !== id);
    fetch(`${API_URL}/api/expenses/${id}`, { method: "DELETE" }).catch(() => {});
  }
  notifySubscribers();
}

// ==========================================
// CUSTOMER ACTIONS
// ==========================================

export function addCustomer(customer) {
  const bizId = activeBusinessId || financialData.business.id || "BUS-001";
  const newCus = {
    id: customer.id || `CUS-${financialData.customers.length + 1}`,
    businessId: bizId,
    name: customer.name || "New Client",
    industry: customer.industry || "General Industry",
    contactEmail: customer.contactEmail || "",
    creditScore: customer.creditScore || "Medium Risk",
    paymentTermsDays: Number(customer.paymentTermsDays) || 30,
    avgDelayDays: Number(customer.avgDelayDays) || 0,
  };
  financialData.customers = [...financialData.customers, newCus];
  notifySubscribers();

  fetch(`${API_URL}/api/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: newCus.id,
      businessId: bizId,
      name: newCus.name,
      industry: newCus.industry,
    }),
  }).catch(() => {});

  return newCus;
}

export function updateCustomer(customerId, updatedFields) {
  financialData.customers = financialData.customers.map((c) =>
    c.id === customerId ? { ...c, ...updatedFields } : c
  );
  notifySubscribers();
}

// ==========================================
// RESET & DEMO CONTROLS
// ==========================================

export function clearAllData() {
  if (activeUserId) {
    try {
      localStorage.removeItem(`fintwin_userdata_${activeUserId}`);
    } catch (e) {}
  }

  financialData = {
    business: { ...cleanBusiness, id: activeBusinessId || "BUS-001" },
    customers: [],
    invoices: [],
    payments: [],
    recurringExpenses: [],
    expenses: [],
  };
  notifySubscribers();
}

export function loadDemoPreset(presetKey = "BUS-001") {
  const preset = demoPresets[presetKey] || demoPresets["BUS-001"];
  if (!preset) return;
  financialData = {
    business: { ...cleanBusiness, id: activeBusinessId || "BUS-001", ...preset.business },
    customers: [...(preset.customers || [])],
    invoices: [...(preset.invoices || [])],
    payments: [...(preset.payments || [])],
    recurringExpenses: [...(preset.recurringExpenses || [])],
    expenses: [...(preset.expenses || [])],
    workers: [...(preset.workers || [])],
    payrollDisbursements: [...(preset.payrollDisbursements || [])],
  };
  notifySubscribers();
}

// ==========================================
// REMOTE DATABASE SYNC
// ==========================================

export async function syncWithBackendDatabase() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      databaseConnected = true;
      try {
        const [bizRes, custRes, invRes] = await Promise.all([
          fetch(`${API_URL}/api/business`),
          fetch(`${API_URL}/api/customers`),
          fetch(`${API_URL}/api/invoices`),
        ]);

        if (bizRes.ok) {
          const bizData = await bizRes.json();
          if (bizData && bizData.business && bizData.business.name) {
            financialData.business = { ...financialData.business, ...bizData.business };
          }
        }
        if (custRes.ok) {
          const cData = await custRes.json();
          if (cData && Array.isArray(cData.customers) && cData.customers.length > 0) {
            financialData.customers = cData.customers;
          }
        }
        if (invRes.ok) {
          const iData = await invRes.json();
          if (iData && Array.isArray(iData.invoices) && iData.invoices.length > 0) {
            financialData.invoices = iData.invoices;
          }
        }
      } catch (err) {
        console.warn("Partial sync error:", err);
      }
    } else {
      databaseConnected = false;
    }
  } catch (error) {
    databaseConnected = false;
  }
  notifySubscribers();
}

// ==========================================
// WORKERS & SALARY PAYROLL ACTIONS
// ==========================================

export function getWorkers() {
  return [...(financialData.workers || [])];
}

export function getPayrollDisbursements() {
  return [...(financialData.payrollDisbursements || [])];
}

export function addWorker(worker) {
  const newWorker = {
    id: worker.id || `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
    name: worker.name || "Worker",
    designation: worker.designation || "Staff Specialist",
    department: worker.department || "Operations",
    monthlySalary: Number(worker.monthlySalary) || 25000,
    phone: worker.phone || "",
    email: worker.email || "",
    bankAccount: worker.bankAccount || "",
    upiId: worker.upiId || "",
    status: worker.status || "Active",
    joiningDate: worker.joiningDate || new Date().toISOString().slice(0, 10),
    lastSalaryPaidDate: null,
  };

  financialData.workers = [newWorker, ...(financialData.workers || [])];
  notifySubscribers();
  return newWorker;
}

export function updateWorker(id, updatedData) {
  financialData.workers = (financialData.workers || []).map((w) =>
    w.id === id ? { ...w, ...updatedData } : w
  );
  notifySubscribers();
}

export function deleteWorker(id) {
  financialData.workers = (financialData.workers || []).filter((w) => w.id !== id);
  notifySubscribers();
}

export function disburseSalary({ workerId, month, bonus = 0, deductions = 0, note = "" }) {
  const worker = (financialData.workers || []).find((w) => w.id === workerId);
  if (!worker) return null;

  const baseSalary = Number(worker.monthlySalary) || 0;
  const netAmount = Math.max(0, baseSalary + Number(bonus) - Number(deductions));
  const dateStr = new Date().toISOString().slice(0, 10);
  const disbursementId = `PAY-${Date.now().toString().slice(-6)}`;

  const disbursement = {
    id: disbursementId,
    workerId: worker.id,
    workerName: worker.name,
    designation: worker.designation,
    department: worker.department,
    month: month || new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    baseSalary,
    bonus: Number(bonus),
    deductions: Number(deductions),
    netAmount,
    disbursedDate: dateStr,
    status: "Completed",
    referenceId: `TXN-UPI-${Math.floor(100000 + Math.random() * 900000)}`,
    note: note || `Monthly salary for ${worker.name}`,
  };

  // 1. Record payroll disbursement
  financialData.payrollDisbursements = [disbursement, ...(financialData.payrollDisbursements || [])];

  // 2. Mark worker's last paid date
  worker.lastSalaryPaidDate = dateStr;

  // 3. Log as an Expense in the Financial ledger so burn rate and runway automatically update
  addExpense({
    category: "Payroll & Salaries",
    description: `Salary: ${worker.name} (${worker.designation})`,
    amount: netAmount,
    recurring: false,
    date: dateStr,
  });

  notifySubscribers();
  return disbursement;
}

export function disburseAllSalaries({ month }) {
  const activeWorkers = (financialData.workers || []).filter((w) => w.status === "Active");
  const results = [];
  activeWorkers.forEach((worker) => {
    const res = disburseSalary({
      workerId: worker.id,
      month: month || new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    });
    if (res) results.push(res);
  });
  return results;
}

export function loadFinancialData() {
  if (activeUserId) {
    syncWithBackendDatabase();
  }
}