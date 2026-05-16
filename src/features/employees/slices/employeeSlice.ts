import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { employeeRepository } from '../api/employeeRepository';
import type { Employee } from '../types/employee';

type SearchCondition = {
  keyword: string;
  department: string;
  status: string;
  skill: string;
};

type EmployeeState = {
  employees: Employee[];
  selectedEmployee: Employee | null;
  searchCondition: SearchCondition;
  loading: boolean;
  error: string | null;
};

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  searchCondition: {
    keyword: '',
    department: '',
    status: '',
    skill: '',
  },
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async () => {
    return employeeRepository.findAll();
  },
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string) => {
    return employeeRepository.findById(id);
  },
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employee: Employee) => {
    return employeeRepository.create(employee);
  },
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async (employee: Employee) => {
    return employeeRepository.update(employee);
  },
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string) => {
    return employeeRepository.delete(id);
  },
);

export const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSearchCondition: (
      state,
      action: PayloadAction<Partial<SearchCondition>>,
    ) => {
      state.searchCondition = {
        ...state.searchCondition,
        ...action.payload,
      };
    },
    clearSearchCondition: (state) => {
      state.searchCondition = {
        keyword: '',
        department: '',
        status: '',
        skill: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state) => {
        state.loading = false;
        state.error = '社員情報の取得に失敗しました';
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload ?? null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.map((employee) =>
          employee.id === action.payload.id ? action.payload : employee,
        );
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (employee) => employee.id !== action.payload,
        );
      });
  },
});

export const { setSearchCondition, clearSearchCondition } =
  employeeSlice.actions;

export const employeeReducer = employeeSlice.reducer;