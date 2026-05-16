# Business Logic Model — Unit 1: Frontend MVP

## BLM-01: 社員一覧フィルタロジック（filterEmployees）

```
入力: employees: Employee[], condition: SearchCondition
出力: Employee[]

処理順序:
1. retired フィルタ
   - condition.showRetired === false の場合: status !== 'retired' のみ通過
   - condition.showRetired === true の場合: 全員通過

2. ステータスフィルタ
   - condition.status が空文字 or 'all': 全員通過
   - condition.status が指定値: status が一致するもののみ通過

3. 部署フィルタ
   - condition.department が空文字: 全員通過
   - 一致するものを通過（完全一致）

4. スキルフィルタ
   - condition.skill が空文字: 全員通過
   - employee.skills に condition.skill を含むものを通過（部分一致）

5. キーワードフィルタ
   - condition.keyword が空文字: 全員通過
   - name, email, profile のいずれかに keyword を含むものを通過（大文字小文字を区別しない）

6. フィルタ結果を返す
```

## BLM-02: ダッシュボード統計計算（dashboardStats）

```
入力: employees: Employee[]
出力: DashboardStats

処理:
1. 在籍中社員の抽出
   activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'leave')

2. 総人数
   totalActive = activeEmployees.length

3. 部署別集計
   byDepartment = activeEmployees.reduce して department ごとにカウント

4. ステータス別集計
   byStatus.active = activeEmployees.filter(e => e.status === 'active').length
   byStatus.leave  = activeEmployees.filter(e => e.status === 'leave').length

5. 注記
   note = "在籍中の社員（稼働中・休業中）のみを集計しています"

6. DashboardStats を返す
```

## BLM-03: フォームバリデーション（validateEmployeeForm）

```
入力: values: EmployeeFormValues, employees: Employee[], editingId?: string
出力: EmployeeFormErrors（空オブジェクトはバリデーション成功）

処理:
1. name: 空文字チェック
2. email:
   a. 空文字チェック
   b. メール形式チェック（正規表現: /^[^\s@]+@[^\s@]+\.[^\s@]+$/）
   c. 重複チェック:
      - 登録時（editingId なし）: 同じ email の社員が存在しないこと
      - 編集時（editingId あり）: editingId 以外の社員に同じ email がないこと
3. department: 空文字チェック
4. position: 空文字チェック
5. employmentType: 有効な選択肢に含まれること
6. status: 有効な選択肢に含まれること
7. joinedAt:
   a. 空文字チェック
   b. YYYY-MM-DD 形式チェック
   c. 未来日付チェック（今日以降の日付は不可）
8. エラーがあればフィールド名をキーに持つエラーオブジェクトを返す
```

## BLM-04: 退職処理フロー

```
トリガー: 「退職処理」ボタンクリック（管理者のみ表示）

処理:
1. 確認ダイアログを表示
   - タイトル: "退職処理の確認"
   - メッセージ: "{name} さんを退職済みにしますか？この操作は編集で元に戻せます。"
   - ボタン: "キャンセル" / "退職処理を実行"

2. ユーザーが確認した場合:
   - updateEmployee({ ...employee, status: 'retired' }) を dispatch
   - 成功時: 詳細ページを再レンダリング（status が retired に更新される）
   - 失敗時: ErrorMessage を表示

3. 「退職処理」ボタンの表示条件:
   - employee.status が 'active' または 'leave' の場合のみ表示
```

## BLM-05: 完全削除フロー

```
トリガー: 「完全削除」ボタンクリック（管理者のみ表示）

処理:
1. 確認ダイアログを表示（危険アクション用スタイル）
   - タイトル: "完全削除の確認"
   - メッセージ: "{name} さんのデータを完全に削除します。この操作は取り消せません。"
   - ボタン: "キャンセル" / "完全に削除する"（削除ボタンは赤色）

2. ユーザーが確認した場合:
   - deleteEmployee(employee.id) を dispatch
   - 成功時: 社員一覧ページ（/employees）へリダイレクト
   - 失敗時: ErrorMessage を表示
```

## BLM-06: 社員登録フロー

```
トリガー: EmployeeCreatePage のフォーム送信

処理:
1. validateEmployeeForm(values, employees) を実行
2. エラーがある場合: フォームにエラー表示、送信しない
3. エラーがない場合:
   a. id = crypto.randomUUID() を生成
   b. createEmployee({ id, ...values }) を dispatch
   c. 成功時: /employees/:id（詳細ページ）へリダイレクト
   d. 失敗時: ErrorMessage を表示
```

## BLM-07: 社員編集フロー

```
トリガー: EmployeeEditPage のフォーム送信

処理:
1. validateEmployeeForm(values, employees, employee.id) を実行
2. エラーがある場合: フォームにエラー表示、送信しない
3. エラーがない場合:
   a. updateEmployee({ ...employee, ...values }) を dispatch
   b. 成功時: /employees/:id（詳細ページ）へリダイレクト
   c. 失敗時: ErrorMessage を表示
```
