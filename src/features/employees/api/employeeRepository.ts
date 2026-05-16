import { employeesMock } from '../data/employees.mock';
import type { Employee } from '../types/employee';

let employees = [...employeesMock];

export const employeeRepository = {
  async findAll(): Promise<Employee[]> {
    return employees;
  },

  async findById(id: string): Promise<Employee | undefined> {
    return employees.find((employee) => employee.id === id);
  },

  async create(employee: Employee): Promise<Employee> {
    employees = [...employees, employee];
    return employee;
  },

  async update(employee: Employee): Promise<Employee> {
    employees = employees.map((currentEmployee) =>
      currentEmployee.id === employee.id ? employee : currentEmployee,
    );

    return employee;
  },

  async delete(id: string): Promise<string> {
    employees = employees.filter((employee) => employee.id !== id);
    return id;
  },
};

// モックデータからAPI通信に切り替えた場合は以下のように変更する
// export const employeeRepository = {
//   async findAll(): Promise<Employee[]> {
//     const response = await fetch('/api/employees');

//     if (!response.ok) {
//       throw new Error('社員情報の取得に失敗しました');
//     }

//     return response.json();
//   },
// };