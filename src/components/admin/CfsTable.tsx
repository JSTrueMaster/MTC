import React from "react";
import api from "src/api";
import Modal from '@material-ui/core/Modal';
import Papa, { ParseResult } from 'papaparse';
import { ExportToCsv } from 'ts-export-to-csv';
import { ToastContainer, toast } from 'react-toastify';
import { DatePickerValue } from "src/components/DatePicker";
import { MenuItem, Box, Button, TextField, Select, SelectChangeEvent } from "@mui/material";
import * as XLSX from 'xlsx';

// グリッドモジュールのインポート
import {
  IgrDataGrid,
  IgrDataGridModule,
  IgrDataGridToolbar,
  IgrDataBindingEventArgs,
  IgrDataGridToolbarModule,
  IgrGridColumnOptionsModule,
  IgrTemplateCellUpdatingEventArgs,
  IgrGridActiveCellChangedEventArgs,
  IgrGridCellValueChangingEventArgs,

  IgrTextColumn,
  IgrComboBoxColumn,
  IgrDateTimeColumn,
  IgrNumericColumn,
  IgrTemplateColumn,
  IgrImageColumn,
  IgrTemplateCellInfo,
  IgrDataGridColumn,
} from 'igniteui-react-grids';


// importing localization data:
import { Localization } from 'igniteui-react-core';
import { payments, items } from 'src/constants/CfsOptions';
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();


export default class CfsTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;

  //set value
  public accounts = ['三菱UFJ銀行', 'ジャパンネット銀行', 'C銀行', '小口現金', '金庫金']
  public userName = localStorage.getItem('userName');

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40

  public old_modal_data = {} as any
  public new_modal_data = {} as any
  public rowIndex = 0
  // pointer track
  public pointer = 0;
  public PAGE_SIZE = 1000; // Define the number of records to load per page
  public tempData: any[] = []
  public Request_Status = 0;
  public Every_Request = false;

  //date format
  public formatter = new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Tokyo',
  });

  constructor(props: any) {

    super(props);

    this.state = {
      data: null,
      loading: true,
      modalRow: null,
      copiedRow: null,
      historyData: null,
      copiedRowIndex: null,

      addRowData: {},
      isAddRow: false,
      isAddRowFocused: false,
      addRowHidden: false,
      lastIndex: 1,

      openDetailModal: false,
      openDeleteModal: false,

      accounts: this.accounts,
      total: 0,

      storeName: props.storeName == '' ? localStorage.getItem('storeName').split(",")[0] : props.storeName,
      storeNames: [],
      choosedStoreName: '',
      choosedExcelFile: null,
    }

    this.onGetData()

    Localization.register("DataGrid-en", new DataGridLocalizationJa());
    Localization.register("DataVisualization-en", new DataGridSummariesLocalizationJa());
    Localization.register("Calendar-en", new DataGridDateTimeColumnLocalizationJa());
    Localization.register("MultiColumnComboBox-en", new DataGridMultiColumnComboBoxLocalizationJa());

  }

  componentDidUpdate(prevProps: any) {

    if (this.props.storeName !== prevProps.storeName) {
      // Perform any actions you need when storeName changes
      this.setState({ storeName: this.props.storeName });
      setTimeout(() => {
        console.log(this.state.storeName);

        this.setState({ total: 0 });
        this.pointer = 0;
        this.onGetData();
      }, 500);
    }
  }

  public onEraseDatePicker = () => {
    let data = this.state.modalRow
    data['年月日'] = null
    this.setState({ modalRow: { ...data } })
  }

  // loading more getting data
  public loadMore = async () => {
    this.pointer = this.pointer + this.PAGE_SIZE
    this.onGetData()
  }
  // loading more getting data end

  public onGetData = async () => {

    // loading params
    const params = {
      dataName: 'sales',
      pointertrack: this.pointer,
      count: this.PAGE_SIZE,
      storeName: this.state.storeName,
    };
    // loading params end
    this.Every_Request = true;
    const res = await api.store.getPointerCfs(params)
    // check getting data status
    if (res.status == 400) return;
    // check getting data status end
    const temp = res.data.data
    if (res.data.lastIndex != 1) {
      this.setState({ lastIndex: res.data.lastIndex + 1, total: res.data.total })
    }
    this.Request_Status = temp.length

    let changedTypeData = [] as any
    let sumObj = {} as any

    this.accounts.forEach((account: string) => {
      sumObj[account] = 0
    })

    temp.forEach((item: any) => {
      //parse integer
      item['No'] = parseInt(item['no'])
      item['入金'] = item['入金'] ? parseInt(item['入金']) : 0
      item['出金'] = item['出金'] ? parseInt(item['出金']) : 0

      this.accounts.forEach((account: string) => {
        if (item['口座名'] == account) {
          sumObj[account] += item['入金'] - item['出金']
        }
        item[account] = sumObj[account]
      })

      item['現預金残高'] = 0
      this.accounts.forEach((account: string) => {
        item['現預金残高'] += sumObj[account]
      })

      //parse date
      item['年月日'] = item['年月日'] ? new Date(item['年月日']) : null
      //set action
      item['操作'] = 2

      changedTypeData.push(item)
    })

    const temp_storeNames = res.data.storeNames
    let storeNames = [] as any
    temp_storeNames.forEach((element: { id: any; 店舗名: any; }) => {
      storeNames.push({ value: element.店舗名, key: element.id })
    });
    this.setState({ storeNames: storeNames })

    // getting result show
    if (params.pointertrack == 0) { // first data getting
      this.setState({ data: changedTypeData })
    } else {                         // next data getting
      this.tempData = this.state.data?.concat(changedTypeData);
      this.setState({ data: this.tempData })
    }
    this.setState({ loading: false });
    if (this.Request_Status != 0) this.loadMore();
    else this.Every_Request = false;
    // getting result show end
  }

  //render
  public render(): JSX.Element {

    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {this.state.loading && <div className="loading" />}
        <div className="gird-container h-full" onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}>
          {/* Header Button */}
          <Box className="flex flex-row justify-end">
            <div
              className="align-middle rounded-tl-lg rounded-tr-lg inline-block w-full px-4 py-4 overflow-hidden !bg-transparent">
              <div className="flex justify-between">
                検索結果 &nbsp;&nbsp;{this.state.total} 件
              </div>
            </div>
            <IgrDataGridToolbar ref={this.onToolbarRef} columnChooser="true" />
            <input
              accept=".xlsx"
              id="csv-file"
              type="file"
              style={{ display: 'none' }}
              onChange={this.onLoadFile}
            />
            <label htmlFor="csv-file">
              <Button component="span" sx={{
                width: 164,
                height: 34,
                color: '#fff !important',
                ":hover": {
                  color: '#000 !important',
                },
                fontFamily: 'Meiryo',
                background: '#0066FF',
                border: 1,
                borderColor: '#24BFF2',
                borderRadius: 22,
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                marginRight: 0.5,
              }}>
                EXCELアップロード
              </Button>
            </label>
            <Button component="span" sx={{
              minWidth: 160,
              height: 34,
              color: '#fff !important',
              ":hover": {
                color: '#000 !important',
              },
              fontFamily: 'Meiryo',
              background: '#0066FF',
              border: 1,
              borderColor: '#24BFF2',
              borderRadius: 22,
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
              marginRight: 0.5,
            }}
              onClick={(event) => {
                event.preventDefault()
                this.onExportExcel("CF確認表")
              }}>
              Excelダウンロード
            </Button>
          </Box>

          <div className="flex flex-col relative igr-table h-full">
            {/* Table */}
            <IgrDataGrid
              ref={this.onGridRef}
              dataSource={this.state.data}

              // editMode={0}
              summaryScope="none"
              filterUIType="FilterRow"
              columnMovingMode={'none'}
              selectionMode="MultipleRow"
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              notifyOnAllSelectionChanges={true}
              cellValueChanging={this.onCellValueChanging}
              cornerRadiusTopRight={this.cornerRadius}
              cornerRadiusTopLeft={this.cornerRadius}
              defaultColumnMinWidth={150}
              rowHeight={this.rowHeight}
              height="calc(100% - 40px)"
              headerBackground="#E6E6E6"
              headerTextColor="#4D4D4D"
              headerTextStyle="Meiryo"
              width="100%"
            >
              <IgrNumericColumn field="No" isEditable={false} pinned={'left'} width={'80'} />
              <IgrTextColumn field="店舗名" width={'*>110'} />
              <IgrDateTimeColumn field="年月日" isEditable={true} dateTimeFormat={0} formatOverride={this.formatter} width={'*>110'} />
              <IgrComboBoxColumn field="口座名" isEditable={true} dataSource={payments} width={'*>110'} />
              <IgrNumericColumn field="入金" isEditable={true} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="出金" isEditable={true} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />

              <IgrNumericColumn field={this.state.accounts[0]} isEditable={false} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field={this.state.accounts[1]} isEditable={false} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field={this.state.accounts[2]} isEditable={false} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field={this.state.accounts[3]} isEditable={false} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field={this.state.accounts[4]} isEditable={false} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />

              <IgrNumericColumn field="現預金残高" isEditable={false} positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrComboBoxColumn field="科目" isEditable={true} dataSource={items} />
              <IgrTextColumn field="相手先" isEditable={true} />
              <IgrTextColumn field="備考１" isEditable={true} />
              <IgrTemplateColumn field="操作" width={'*>150'} pinned='right' cellUpdating={this.onActionCellUpdating} />
            </IgrDataGrid>

            <div className={`flex ${!this.state.addRowHidden && 'hidden'} absolute overflow-x-auto overflow-y-hidden w-full bottom-[44px]`} onScroll={this.handleScroll} onClick={this.handlClick}>
              <input className="addRow-input text-right !w-[80px]" placeholder="No" type="number" value={this.state.addRowData['No']} onChange={() => { return; }} />
              <div className="flex addRow-input min-w-[110px] 年月日aa">
                <DatePickerValue date={this.state.addRowData['年月日']} onChange={(value: any) => this.onChangedAddRow('年月日', value)} />
              </div>
              <div className="flex addRow-input min-w-[110px] 口座名">
                <Select className="w-6/12 my-auto h-[34px] w-[110px]" value={(this.state.addRowData['口座名']) ? this.state.addRowData['口座名'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('口座名', event.target.value)} >
                  {
                    payments.map((item) => {
                      return (
                        <MenuItem key={item.value} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <input className="addRow-input min-w-[110px]" placeholder="入金" type="number" value={this.state.addRowData['入金']} onChange={(event) => this.onChangedAddRow('入金', event.target.value)} />
              <input className="addRow-input min-w-[110px]" placeholder="出金" type="number" value={this.state.addRowData['出金']} onChange={(event) => this.onChangedAddRow('出金', event.target.value)} />
              <input className="addRow-input min-w-[110px]" placeholder={this.state.accounts[0]} type="number" value={this.state.addRowData[this.state.accounts[0]]} disabled />
              <input className="addRow-input min-w-[110px]" placeholder={this.state.accounts[1]} type="number" value={this.state.addRowData[this.state.accounts[1]]} disabled />
              <input className="addRow-input min-w-[110px]" placeholder={this.state.accounts[2]} type="number" value={this.state.addRowData[this.state.accounts[2]]} disabled />
              <input className="addRow-input min-w-[110px]" placeholder={this.state.accounts[3]} type="number" value={this.state.addRowData[this.state.accounts[3]]} disabled />
              <input className="addRow-input min-w-[110px]" placeholder={this.state.accounts[4]} type="number" value={this.state.addRowData[this.state.accounts[4]]} disabled />
              <input className="addRow-input min-w-[110px]" placeholder="現預金残高" type="number" value={this.state.addRowData['現預金残高']} disabled />

              <div className="flex addRow-input min-w-[150px] 科目">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['科目']) ? this.state.addRowData['科目'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('科目', event.target.value)}>
                  {
                    items.map((item) => {
                      return (
                        <MenuItem key={item.value} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <input className="addRow-input" placeholder="相手先" value={this.state.addRowData['相手先']} onChange={(event) => this.onChangedAddRow('相手先', event.target.value)} />
              <input className="addRow-input" placeholder="備考１" value={this.state.addRowData['備考１']} onChange={(event) => this.onChangedAddRow('備考１', event.target.value)} />
            </div>
            {!this.state.addRowHidden ?
              <Button className="flex mt-2 addBtn" sx={{
                width: 93,
                height: 37,
                color: '#1A1A1A',
                fontFamily: 'Meiryo',
                borderRadius: 8,
                background: '#E6E6E6',
              }}
                onClick={this.onAddRow}
              >+ 新規登録</Button> :
              <div className="flex mt-5">
                <Button className="flex addBtn" sx={{
                  width: 93,
                  height: 37,
                  color: '#FFF',
                  fontFamily: 'Meiryo',
                  borderRadius: 8,
                  background: '#0066FF',
                }}
                  onClick={this.onAddRowSave}
                >保 存</Button>
                <Button className="flex addBtn !ml-2" sx={{
                  width: 93,
                  height: 37,
                  color: '#FFF',
                  fontFamily: 'Meiryo',
                  borderRadius: 8,
                  background: '#808080',
                }}
                  onClick={this.onAddRowCancel}
                >キャンセル</Button>
              </div>
            }
          </div>
        </div>
        {/* Modal */}
        <Modal
          className="min-w-[876px]"
          open={this.state.openDetailModal}
          style={{
            position: 'absolute',
            width: '50vw',
            margin: 'auto',
            height: '90vh',
          }}
          onClose={() => {
            this.setState({ openDetailModal: false })
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full border-none">
            <div className="flex w-full h-[70px] px-[40px] bg-[#BCD8F1] rounded-t-[20px]">
              <h1 className="font-Meiryo text-black text-[20px] my-auto">CF詳細</h1>
            </div>
            <div className="bg-white p-5 overflow-y-auto rounded-b-[20px]">

              {/* No & Contract */}
              <div className="flex w-full">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">No</label>
                  <label className="w-6/12 my-auto">{this.state.modalRow?.['No']}</label>
                </div>
                <div className="flex w-full pr-5"></div>
              </div>

              {/* No & Contract */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">年月日</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue date={this.state.modalRow?.['年月日']} onChange={(value: any) => {
                      const tempY = value?.$d?.getFullYear()
                      const tempM = value?.$d?.getMonth() + 1
                      const tempD = value?.$d?.getDate()
                      const regex = /^\d{4}-\d{1,2}-\d{1,2}$/
                      if (regex.test(tempY + '-' + tempM + '-' + tempD)) {
                        let data = this.state.modalRow
                        data['年月日'] = new Date(value.toLocaleString("ja-JP"));
                        this.setState({ modalRow: data })
                      }
                    }} />
                  </div>
                  <IconButton aria-label="cancel" className="!ml-[-10px]" onClick={this.onEraseDatePicker}>
                    <CancelIcon />
                  </IconButton>
                </div>

                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">口座名</label>
                  <Select className="w-6/12 my-auto h-[34px]"
                    value={(this.state.modalRow?.['口座名']) ? this.state.modalRow?.['口座名'] : ""}
                    onChange={(event: SelectChangeEvent) => {
                      let data = this.state.modalRow
                      const oldAccount = data['口座名']
                      const newAccount = event.target.value

                      data[oldAccount] -= (parseFloat(data['入金']) - parseFloat(data['出金'])) || 0
                      data[newAccount] += (parseFloat(data['入金']) - parseFloat(data['出金'])) || 0

                      data['口座名'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      payments.map((item, key) => {
                        return (
                          <MenuItem value={`${item.value}`} key={key}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>
              </div>

              {/* INCOME & OUTCOMING */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">入金</label>
                  <TextField className="w-6/12 my-auto"
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['入金']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      const oldIncome = parseFloat(data['入金'])
                      const newIncome = parseFloat(event.target.value)
                      const account = data['口座名']

                      data[account] += (newIncome - oldIncome) || 0

                      data['入金'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">出金</label>
                  <TextField className="w-6/12 my-auto"
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['出金']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      const oldOutcome = parseFloat(data['出金'])
                      const newOutcome = parseFloat(event.target.value)
                      const account = data['口座名']

                      data[account] -= (newOutcome - oldOutcome) || 0

                      data['出金'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* 三菱UFJ銀行 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">三菱UFJ銀行</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    disabled={true}
                    value={this.state.modalRow?.['三菱UFJ銀行']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['三菱UFJ銀行'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">ジャパンネット銀行</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    disabled={true}
                    value={this.state.modalRow?.['ジャパンネット銀行']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['ジャパンネット銀行'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* 残高2 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">C銀行</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    disabled={true}
                    value={this.state.modalRow?.['C銀行']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['C銀行'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">小口現金</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    disabled={true}
                    value={this.state.modalRow?.['小口現金']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['小口現金'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* 残高3 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">金庫金</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    disabled={true}
                    value={this.state.modalRow?.['金庫金']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['金庫金'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">現預金残高</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    disabled={true}
                    value={this.state.modalRow?.['現預金残高']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['現預金残高'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* 科目 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">科目</label>
                  <Select className="w-6/12 my-auto h-[34px]"
                    value={(this.state.modalRow?.['科目']) ? this.state.modalRow?.['科目'] : ""}
                    onChange={(event: SelectChangeEvent) => {
                      let data = this.state.modalRow
                      data['科目'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      items.map((item, key) => {
                        return (
                          <MenuItem value={`${item.value}`} key={key}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>

                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">相手先</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['相手先']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['相手先'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>

              </div>

              {/* 備考１ */}
              <div className="flex w-full my-5">

                <div className="flex w-1/2 pr-5">
                  <label className="w-6/12 my-auto pl-10">備考１</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['備考１']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['備考１'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* History */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">変更履歴 </label>
                <div className="w-9/12 border-solid border-[0.6px] border-[#c4c4c4] rounded-[5px] overflow-y-auto p-3 h-[150px]">

                  {
                    this.state.historyData?.map((element: any, key: number) => {
                      return (
                        <div key={key}>
                          {element.updatedAt}　{element.updatedByUsername}<br />
                          {element.field} : {element.oldValue == '1/1/1970' ? '空' : element.oldValue} &rarr; {element.newValue == '1/1/1970' ? '空' : element.newValue}
                          <br /><hr /><br />
                        </div>
                      )
                    })

                  }

                </div>
              </div>

              <div className="flex justify-center mx-auto w-full">
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ openDetailModal: false })

                    const index = parseInt(localStorage.getItem('old_modal_rowIndex'), 10);
                    const old_modal_data = JSON.parse(localStorage.getItem('old_modal_data'));
                    if (old_modal_data['年月日'] == '') {
                      old_modal_data['年月日'] = null;
                    }
                    let data = this.state.data
                    data[index] = old_modal_data;

                    this.grid.notifyInsertItem(index, old_modal_data);
                  }}
                >キャンセル</button>
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault()
                    this.onSaveDetailModal()
                  }}>保  存</button>
              </div>


            </div>
          </div>

        </Modal>
        <Modal
          open={this.state.openDeleteModal}
          style={{
            position: 'absolute',
            margin: 'auto',
            height: 194,
            width: 264,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-t-[10px]">
            <div className="flex w-full h-[40px] px-[30px] bg-[#BCD8F1] rounded-t-[10px]">
              <h1 className="font-Meiryo text-[14px] my-auto">削除</h1>
            </div>
            <div className="flex flex-col m-auto">
              <h5 className="font-Meiryo text-[14px] my-[20px] mx-auto text-center">本当に削除しますか？</h5>
              <div className="flex flex-row justify-content">
                <button className="w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ openDeleteModal: false })
                  }}
                >いいえ</button>
                <button className="w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault()
                    this.onDeleteRow()
                  }}
                >は い</button>
              </div>
            </div>
          </div>

        </Modal>
        <Modal
          open={this.state.openChooseStoreModal}
          style={{
            position: 'absolute',
            top: 150,
            marginInline: 'auto',
            height: 194,
            width: 300,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-t-[10px]">
            <div className="flex w-full h-[40px] px-[30px] bg-[#BCD8F1] rounded-t-[10px]">
              <h1 className="font-Meiryo text-[14px] my-auto">店舗名を入力してください。</h1>
            </div>
            <div className="flex flex-col m-auto">
              <Select className="w-6/12 my-auto h-[34px] !w-[100%] border !mb-5" value={this.state.choosedStoreName} sx={{
                "fieldset": {
                  border: 'none',
                }
              }}
                onChange={(event) => this.setState({ choosedStoreName: event.target.value })} >
                {
                  this.state.storeNames.map((item: any, key: any) => {
                    return (
                      <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                        {item.value}
                      </MenuItem>
                    )
                  })
                }
              </Select>
              <div className="flex flex-row justify-content">
                <button className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ openChooseStoreModal: false })
                  }}
                >いいえ</button>
                <button className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault()
                    this.onUploadExcel(e)
                  }}
                >は い</button>
              </div>
            </div>
          </div>

        </Modal>
      </>
    );
  }

  //IgrDataGrid methods
  public onGridRef = (grid: IgrDataGrid) => {
    if (!grid) { return; }

    this.grid = grid;
    if (!this.grid) {
      return;
    }

    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }

  }

  public onToolbarRef = (toolbar: IgrDataGridToolbar) => {
    this.toolbar = toolbar;
    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }
  }

  public onActionCellUpdating = (s: any, e: IgrTemplateCellUpdatingEventArgs) => {

    const content = e.content as HTMLDivElement;
    content.style.display = 'flex'
    content.style.padding = '5px'

    let span1: HTMLSpanElement | null = null;
    let span2: HTMLSpanElement | null = null;

    if (e.cellInfo.rowItem['操作'] == 1) {
      //save and cancel 1
      content.innerHTML = ""
      if (content.childElementCount === 0) {

        span1 = document.createElement('span')
        span1.textContent = 'キャンセル'
        span1.style.backgroundColor = '#808080'
        span1.style.borderRadius = '5px'
        span1.style.height = '27px'
        span1.style.display = 'flex'
        span1.style.alignItems = 'center'
        span1.style.paddingInline = '2px'
        span1.style.color = '#FFFFFF'
        span1.style.margin = 'auto'
        span1.style.cursor = 'pointer'

        span1.onclick = event => {
          event.preventDefault()
          this.onCancelRow(e)
        }

        content.appendChild(span1)

        span2 = document.createElement('span')
        span2.textContent = '保存'
        span2.style.backgroundColor = '#0066FF'
        span2.style.borderRadius = '5px'
        span2.style.height = '27px'
        span2.style.display = 'flex'
        span2.style.alignItems = 'center'
        span2.style.paddingInline = '2px'
        span2.style.color = '#FFFFFF'
        span2.style.margin = 'auto'
        span2.style.cursor = 'pointer'

        span2.onclick = event => {
          event.preventDefault()
          this.onSaveRow(e)
        }

        content.appendChild(span2)
      } else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
      }
    } else if (e.cellInfo.rowItem['操作'] == 2) {
      //Editable 2
      content.innerHTML = ""
      if (content.childElementCount === 0) {
        span1 = document.createElement('span')
        span1.textContent = '詳細'
        span1.style.color = '#0066FF'
        span1.onclick = event => {
          event.preventDefault()
          this.onOpenDetailModal(e.cellInfo.rowItem)
        }
        span1.style.margin = 'auto'
        span1.style.cursor = 'pointer'

        content.appendChild(span1)

        span2 = document.createElement('span')
        span2.textContent = '削除'
        span2.style.color = '#F24024'
        span2.style.margin = 'auto'
        span2.style.cursor = 'pointer'

        span2.onclick = e => {
          e.preventDefault()
          this.setState({ openDeleteModal: true })
        }

        content.appendChild(span2)
      }
      else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
      }
    }
  }

  public changedHistoryData = [] as any
  public onCellValueChanging = (s: IgrDataGrid, e: IgrGridCellValueChangingEventArgs) => {

    const rowIndex = s.activeCell.rowIndex;
    const dataItem = s.actualDataSource.getItemAtIndex(rowIndex)
    const columnKey = e.column.field

    let obj = {} as any

    obj['rowIndex'] = rowIndex
    obj['field'] = columnKey
    obj['product_number'] = dataItem['No']
    obj['old_value'] = e.oldValue
    obj['new_value'] = e.newValue
    obj['username'] = this.userName

    this.changedHistoryData.push(obj)

    e.cellInfo.rowItem['操作'] = 1;
  }

  //cancel changed value
  public onCancelRow = (e: IgrTemplateCellUpdatingEventArgs) => {
    const rowIndex = this.grid.activeCell.rowIndex
    e.cellInfo.rowItem['操作'] = 2

    //set origin value
    let otherHistoryData = [] as any
    this.changedHistoryData.forEach((element: any) => {

      if (rowIndex == element['rowIndex']) {

        let data = [...this.state.data]
        data[rowIndex][element['field']] = element['old_value'];
        this.setState({ data: data });

      } else {
        otherHistoryData.push(element)
      }
    })

    this.changedHistoryData = otherHistoryData
  }

  //save changed value
  public onSaveRow = async (e: IgrTemplateCellUpdatingEventArgs) => {
    if (this.Every_Request) return;
    this.Every_Request = true;
    e.cellInfo.rowItem['操作'] = 2
    //save changed value
    if (e.cellInfo.rowItem['id']) {
      const res = await api.store.updateCf(e.cellInfo.rowItem['id'], e.cellInfo.rowItem)
      if (res.status == 200) {
        this.setState({ loading: true });

        console.log('reset data by calculate');
        // this.onGetData()
        let changedTypeData = [] as any
        let sumObj = {} as any

        this.accounts.forEach((account: string) => {
          sumObj[account] = 0
        })

        this.state.data.forEach((item: any) => {
          //parse integer
          item['No'] = parseInt(item['no'])
          item['入金'] = item['入金'] ? parseInt(item['入金']) : 0
          item['出金'] = item['出金'] ? parseInt(item['出金']) : 0

          this.accounts.forEach((account: string) => {
            if (item['口座名'] == account) {
              sumObj[account] += item['入金'] - item['出金']
            }
            item[account] = sumObj[account]
          })

          item['現預金残高'] = 0
          this.accounts.forEach((account: string) => {
            item['現預金残高'] += sumObj[account]
          })

          //parse date
          item['年月日'] = item['年月日'] ? new Date(item['年月日']) : null
          //set action
          item['操作'] = 2

          changedTypeData.push(item)
        })

        this.setState({ data: changedTypeData })
        this.setState({ loading: false });

      }

      //add update history
      let ownHistoryData = [] as any
      let otherHistoryData = [] as any
      this.changedHistoryData.forEach((element: any) => {
        if (e.cellInfo.rowItem['No'] == element['product_number']) {
          ownHistoryData.push(element)
        } else {
          otherHistoryData.push(element)
        }
      })

      const res_history = await api.store.updateCfHistory(e.cellInfo.rowItem['id'], ownHistoryData)
      this.changedHistoryData = otherHistoryData
    } else {
      const res = await api.store.createCf(e.cellInfo.rowItem)
    }
    this.Every_Request = false;
  }

  //delete selected row
  public onDeleteRow = async () => {
    if (this.Every_Request) return;
    // Make a copy of data array
    let data = [...this.state.data]

    this.activeRowIndex = this.grid.activeCell.rowIndex;
    const row = data[this.activeRowIndex]
    const res = await api.store.deleteCf(row['id'])

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ openDeleteModal: false })
  }

  //add new row
  public onAddRow = () => {
    const new_data = {
      'No': this.state.lastIndex, '年月日': new Date(), '口座名': '', '入金': 0, '出金': 0,
      [this.accounts[0]]: 0,
      [this.accounts[1]]: 0,
      [this.accounts[2]]: 0,
      [this.accounts[3]]: 0,
      [this.accounts[4]]: 0,
      '現預金残高': 0, '科目': '', '相手先': '', '備考１': '', '操作': 0
    }
    this.setState({ addRowData: new_data })
    this.setState({ addRowHidden: true })
  }

  public handleScroll = (event: any) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    this.grid.scrollTo(scrollLeft, 10000000)
  }

  public onChangedAddRow = (field: string, value: any) => {

    const lastData = this.state.data[this.state.data.length - 1]
    let data = this.state.addRowData

    if (field == '年月日') {

      const isoString = value.toISOString(); // Outputs "2022-01-01T00:00:00.000Z"
      const jstDateObj = new Date(isoString);
      const jstString = jstDateObj.toLocaleString("ja-JP", { year: 'numeric', month: '2-digit', day: '2-digit' });
      data[field] = jstString

    } else if (field == '入金' || field == '出金' || field == '口座名') {

      data[field] = value
      data['現預金残高'] = lastData['現預金残高']
      this.accounts.forEach((account: string) => {
        if (data['口座名'] == account) {
          data[account] = data['入金'] - data['出金'] + lastData[account]
          data['現預金残高'] += data['入金'] - data['出金']
        } else {
          data[account] = lastData[account]
        }
      })
    } else
      data[field] = value

    this.setState({ addRowData: data })
  }

  public onAddRowSave = async () => {
    if (this.Every_Request) return;
    this.Every_Request = true;
    try {
      const res = await api.store.createCf(this.state.addRowData)
      if (res.status == 201) {

        let data = this.state.data
        let temp = this.state.addRowData
        temp['id'] = res.data.id
        data.push(temp)
        this.grid.notifyInsertItem(data.length - 1, this.state.addRowData)
        this.setState({ total: this.state.total + 1 })
        toast.success('保存されました。')

        //update calculate
        let calculatedData = [] as any
        let sumObj = {} as any

        this.accounts.forEach((account: string) => {
          sumObj[account] = 0
        })

        data.forEach((item: any) => {
          //parse integer
          item['No'] = parseInt(item['No'])
          item['入金'] = item['入金'] ? parseInt(item['入金']) : 0
          item['出金'] = item['出金'] ? parseInt(item['出金']) : 0

          this.accounts.forEach((account: string) => {
            if (item['口座名'] == account) {
              sumObj[account] += item['入金'] - item['出金']
            }
            item[account] = sumObj[account]
          })

          item['現預金残高'] = 0
          this.accounts.forEach((account: string) => {
            item['現預金残高'] += sumObj[account]
          })

          //parse date
          item['年月日'] = item['年月日'] ? new Date(item['年月日']) : null
          //set action
          item['操作'] = 2

          calculatedData.push(item)
        })
        this.setState({ data: calculatedData });

      } else {
        toast.error('保存が失敗しました。')
      }
    } catch (err) {
      toast.error('予期しないエラー発生しました。')
    }

    this.setState({ isAddRow: false })
    this.setState({ addRowHidden: false })

    this.Every_Request = false;
  }

  public onAddRowCancel = () => {
    this.setState({ isAddRow: false })
    this.setState({ addRowHidden: false })
  }

  //open detail modal
  public onOpenDetailModal = async (row: any) => {
    if (this.Every_Request) return;
    this.Every_Request = true;

    const rowIndex = this.grid.activeCell.rowIndex

    localStorage.setItem('old_modal_rowIndex', rowIndex.toString());
    localStorage.setItem('old_modal_data', JSON.stringify(this.grid.dataSource[rowIndex]));

    this.setState({ modalRow: row })
    this.setState({ openDetailModal: true })

    //get history
    const id = this.grid.dataSource[rowIndex]['id']

    this.rowIndex = rowIndex
    this.new_modal_data = this.grid.dataSource[rowIndex]
    const res = await api.store.getCfHistory(id)

    this.setState({ historyData: res.data.data })
    this.Every_Request = false;
  }

  public onSaveDetailModal = async () => {
    //save changed value
    this.Every_Request = true;
    if (this.state.modalRow['id']) {
      const res = await api.store.updateCf(this.state.modalRow['id'], this.state.modalRow)
    } else {
      const res = await api.store.createCf(this.state.modalRow)
    }
    const rowIndex = this.grid.activeCell.rowIndex
    this.grid.notifySetItem(rowIndex, this.grid.dataSource[rowIndex], this.state.modalRow)
    this.setState({ openDetailModal: false })
    toast.success('保存されました。')
    this.Every_Request = false;
  }

  //key event
  public onKeyDown = (event: any) => {

    if (this.grid.activeCell == null) return;

    let data = this.state.data;

    if ((event.ctrlKey) && event.code === 'KeyC') {

      this.activeRowIndex = this.grid.activeCell.rowIndex;
      this.setState({ copiedRowIndex: this.activeRowIndex, copiedRow: data[this.activeRowIndex] })
      console.log('CPIED: ', this.activeRowIndex)
    }
  }

  public onKeyUp = (event: any) => {
    if (this.grid.activeCell == null || this.state.copiedRow == null) return;

    let data = this.state.data; // Make a copy of data array

    if ((event.ctrlKey) && event.code === 'KeyV') {

      console.log('PASETD')

      if (!this.state.isAddRowFocused) {

        this.activeRowIndex = this.grid.activeCell.rowIndex;
        const rowId = data[this.activeRowIndex]['id'];
        const rowNo = data[this.activeRowIndex]['No'];
        const rowDate = data[this.activeRowIndex]['年月日'];

        // Remove the original row from the array
        data.splice(this.activeRowIndex, 1);

        // Create a new object with the copied row data
        const newRowData = { ...this.state.copiedRow };
        newRowData['id'] = rowId
        newRowData['no'] = rowNo
        newRowData['年月日'] = rowDate
        newRowData['操作'] = 1

        // Insert the new row at the active row index
        data.splice(this.activeRowIndex, 0, newRowData);


        //update calculate
        let calculatedData = [] as any
        let sumObj = {} as any

        this.accounts.forEach((account: string) => {
          sumObj[account] = 0
        })

        data.forEach((item: any) => {
          //parse integer
          item['No'] = parseInt(item['no'])
          item['入金'] = item['入金'] ? parseInt(item['入金']) : 0
          item['出金'] = item['出金'] ? parseInt(item['出金']) : 0

          this.accounts.forEach((account: string) => {
            if (item['口座名'] == account) {
              sumObj[account] += item['入金'] - item['出金']
            }
            item[account] = sumObj[account]
          })

          item['現預金残高'] = 0
          this.accounts.forEach((account: string) => {
            item['現預金残高'] += sumObj[account]
          })

          //parse date
          item['年月日'] = item['年月日'] ? new Date(item['年月日']) : null
          //set action
          if (rowId == item['id']) item['操作'] = 1
          else item['操作'] = 2

          calculatedData.push(item)
        })

        this.setState({ data: calculatedData });
        this.grid.notifyInsertItem(this.activeRowIndex, 1);

        //set history
        let obj = {} as any

        obj['field'] = 'コピー済み'
        obj['product_number'] = rowNo
        obj['old_value'] = '商品' + this.state.copiedRow['No']
        obj['new_value'] = '商品' + rowNo
        obj['username'] = this.userName
        this.changedHistoryData.push(obj)

      } else {

        const addRowData = this.state.addRowData
        const productNo = addRowData['No']
        const registerDT = addRowData['年月日']

        const newRowData = { ...this.state.copiedRow };
        newRowData['no'] = productNo
        newRowData['年月日'] = registerDT
        this.accounts.forEach((account: string) => {
          newRowData[account] = 0
        })
        newRowData['現預金残高'] = 0

        this.setState({ addRowData: newRowData })
        this.setState({ isAddRowFocused: false })
        this.setState({ copiedRow: null })

      }
    }
  }

  public handlClick = async (event: any) => {
    this.setState({ isAddRowFocused: true })
  }


  public convertDate = (excelDate: number) => {
    // const excelDate = 43647;
    const convertedDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000) - (9 * 60 * 60 * 1000));
    return convertedDate.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  public convertTime = (excelTime: number) => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const excelDate = new Date(excelTime * millisecondsPerDay - (9 * 60 * 60 * 1000));
    return excelDate.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' });
  }

  //upload csv
  public onLoadFile = (event: any) => {
    const file = event.target.files[0];
    this.setState({ choosedExcelFile: file });
    this.setState({ openChooseStoreModal: true });
    event.target.value = '';
  }

  public onUploadExcel = (event: any) => {

    this.setState({ openChooseStoreModal: false });

    const storeName = this.state.choosedStoreName;
    if (storeName == null || storeName == '') {
      toast.warning('店舗名を入力してください。');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;
    if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast.warning('申し訳ありませんが、xlsxフォーマットのファイルを入れてください。')
      return;
    }

    this.setState({ loading: true });

    const reader = new FileReader();

    reader.onload = async (e) => {

      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets['CF確認表'];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const final_results = [] as any;
      jsonData.forEach((element: any, index) => {
        if (index > 1 && element[1]) {
          final_results.push({
            'No': index - 1,
            '店舗名': storeName,
            '年月日': element[1] ? this.convertDate(element[1]) : '',
            '口座名': element[2] ? element[2] : '',
            '入金': element[3] ? element[3] : '',
            '出金': element[4] ? element[4] : '',
            '現預金残高': element[10] ? element[10] : '',
            '科目': element[11] ? element[11] : '',
            '相手先': element[12] ? element[12] : '',
            '備考１': element[13] ? element[13] : '',
          });
        }
      });

      await api.store.csvUploadCf(final_results).then((response: any) => {
        if (response.data.success === true) {
          window.location.reload()
        }
      });

    };

    reader.readAsArrayBuffer(file);
  }

  public onExportExcel = (t: string) => {
    let data = [] as any

    this.state.data.forEach((element: any, index: number) => {
      const arr = [] as any
      const title = [] as any

      Object.entries(element).map(([key, value]) => {
        if (
          key != '$hashCode' &&
          key != "id" &&
          key != "v" &&
          key != "No"
        ) {
          if (index == 0) {
            title.push(key)
          }
          switch (key) {
            case "入金":
            case "出金":
            case "三菱UFJ銀行":
            case "ジャパンネット銀行":
            case "C銀行":
            case "小口現金":
            case "金庫金":
            case "現預金残高":
              arr.push(this.currencyFormatter(value as number))
              break;
            default:
              arr.push(value)
              break;
          }
        }
      })
      if (index == 0) { data.push(title) }
      data.push(arr)
    })

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // // Cast the mergeRanges array to Range[] type
    // worksheet['!merges'] = mergeRanges as XLSX.Range[];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, t + ".xlsx");
  }

  public currencyFormatter = (number: number | bigint) => {
    return new Intl.NumberFormat('en-JP', { style: 'currency', currency: 'JPY' }).format(number)
  }


}

