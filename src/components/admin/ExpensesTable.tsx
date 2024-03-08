import React from "react";
import api from "src/api";
import Modal from '@material-ui/core/Modal';
import Papa, { ParseResult } from 'papaparse';
import { ToastContainer, toast } from 'react-toastify';
import DragDropFile from "src/components/DragDropFile";
import { DatePickerValue } from "src/components/DatePicker";
import { MenuItem, Box, Button, TextField, Select, SelectChangeEvent } from "@mui/material";
import * as XLSX from 'xlsx';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';

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
  IgrFilterOperand,
  EditorType,
  IgrGridCustomFilterRequestedEventArgs,
} from 'igniteui-react-grids';

// importing localization data:
import dayjs, { Dayjs } from 'dayjs';
import { FILE_PATH } from "src/configs/AppConfig";
import { Localization } from 'igniteui-react-core';
import { subjects, accounts } from 'src/constants/Expenses';
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();

export default class ExpensesTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;

  //set value
  public FILE_PATH = FILE_PATH;
  public userName = localStorage.getItem('userName');

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 200
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
      data: [],
      files: [],
      loading: true,
      copiedRow: null,
      historyData: null,
      copiedRowIndex: null,

      addRowData: {},
      isAddRow: false,
      isAddRowFocused: false,
      addRowHidden: false,
      lastIndex: 1,

      modalRow: null,
      fileURL: null,
      fileURLID: null,
      openAddModal: false,
      openViewModal: false,
      openRemoveModal: false,
      openDetailModal: false,
      openDeleteModal: false,

      total: 0,
      selectedDate1: '',
      selectedDate2: '',

      storeName: props.storeName == '' ? localStorage.getItem('storeName').split(",")[0] : props.storeName,
      storeNames: [],
      choosedStoreName: '',
      choosedExcelFile: null,
    }

    this.onGetData();
    
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

  // loading more getting data
  public loadMore = async () => {
    this.pointer = this.pointer + this.PAGE_SIZE
    this.onGetData()
  }
  // loading more getting data end

  public onGetData = async () => {

    // loading params
    const params = {
      dataName: 'expenses',
      pointertrack: this.pointer,
      count: this.PAGE_SIZE,
      storeName: this.state.storeName,
    };

    // loading params end
    const res = await api.store.getPointerExpenses(params)
    // check getting data status
    if (res.status == 400) return;
    const temp = res.data.data
    if (res.data.lastIndex != 1) {
      this.setState({ lastIndex: res.data.lastIndex + 1, total: res.data.total })
    }
    this.Request_Status = temp.length

    let changedTypeData: any[] = []

    temp.forEach((item: any) => {

      item['No'] = item['no']
      item['計上月'] = item['計上月'] ? new Date(item['計上月']) : null
      item['支払日'] = item['支払日'] ? new Date(item['支払日']) : null
      // item['内容'] = item['内容'].replace(/　/g,'・')
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
      // this.tempData = changedTypeData;
      this.setState({ data: changedTypeData })
    } else {                         // next data getting
      this.tempData = this.state.data?.concat(changedTypeData);
      this.setState({ data: this.tempData })
    }
    this.setState({ loading: false });
    if (this.Request_Status != 0) this.loadMore();
    // getting result show end

  }

  public onEraseDatePicker = (type: number) => {
    let data = this.state.modalRow
    if (type == 1) data['計上月'] = null
    else if (type == 2) data['支払日'] = null
    this.setState({ modalRow: { ...data } })
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
        <div className="gird-container h-full"
        // onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}
        >
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
                Excelアップロード
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
                this.onExportExcel("経費一覧")
              }}>
              Excelダウンロード
            </Button>
          </Box>

          <div className="flex flex-col relative igr-table h-full">
            {/* Table */}
            <IgrDataGrid
              ref={this.onGridRef}
              dataSource={this.state.data}
              primaryKey={["id"]}
              editMode={1}
              summaryScope="none"
              filterUIType="FilterRow"
              columnMovingMode={'none'}
              // headerClickAction={'none'}
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              // selectionMode="MultipleRow"
              notifyOnAllSelectionChanges={true}
              cellValueChanging={this.onCellValueChanging}
              // activeCellChanged={this.onActiveCellChange}

              // isPagerVisible="true"
              // pageSize="10"
              // cellValueChanging={}
              // editOnKeyPress={false}

              cornerRadiusTopRight={this.cornerRadius}
              cornerRadiusTopLeft={this.cornerRadius}
              defaultColumnMinWidth={150}
              rowHeight={this.rowHeight}
              headerBackground="#E6E6E6"
              height="calc(100% - 40px)"
              headerTextColor="#4D4D4D"
              headerTextStyle="Meiryo"
              width="100%"
            >
              <IgrNumericColumn field="No" isEditable={false} pinned={'left'} width={'80'} />
              <IgrTextColumn field="店舗名" width={'*>110'} />
              <IgrDateTimeColumn field="計上月" dateTimeFormat={0} formatOverride={this.formatter} width={'*>110'} />
              <IgrDateTimeColumn field="支払日" dateTimeFormat={0} formatOverride={this.formatter} width={'*>110'} />
              <IgrComboBoxColumn field="勘定科目" dataSource={subjects} width={'*>110'} />
              <IgrComboBoxColumn field="支払口座/小口" dataSource={accounts} width={'*>110'} />
              <IgrTextColumn field="支払先" />
              <IgrTextColumn field="内容" />
              <IgrNumericColumn field="金額" positivePrefix="¥" showGroupingSeparator="true" width={'*>110'} />
              <IgrTextColumn field="経費対象" width={'*>110'} />
              <IgrTextColumn field="備考" />
              <IgrTemplateColumn field="書類" cellUpdating={this.onFileCellUpdating} width={`*>110`} />
              <IgrTemplateColumn field="操作" width={'*>150'} pinned='right' cellUpdating={this.onActionCellUpdating} />

            </IgrDataGrid>
            {/* Bottom Button */}
            <div className={`flex ${!this.state.addRowHidden && 'hidden'} absolute overflow-x-auto overflow-y-hidden w-full bottom-[43px]`} onScroll={this.handleScroll} onClick={this.handlClick}>
              <input className="addRow-input text-right !w-[80px]" placeholder="No" type="number" value={this.state.addRowData['No']} onChange={() => { return; }} />
              <div className="flex addRow-input min-w-[110px] 計上月">
                <DatePickerValue date={this.state.addRowData['計上月']} onChange={(value: any) => {
                  const tempY = value?.$d?.getFullYear()
                  const tempM = value?.$d?.getMonth() + 1
                  const tempD = value?.$d?.getDate()
                  const regex = /^\d{4}-\d{1,2}-\d{1,2}$/
                  if (regex.test(tempY + '-' + tempM + '-' + tempD)) {
                    this.onChangedAddRow('計上月', value)
                  }
                }} />
              </div>
              <div className="flex addRow-input min-w-[110px] 支払日">
                <DatePickerValue date={this.state.addRowData['支払日']} onChange={(value: any) => {
                  const tempY = value?.$d?.getFullYear()
                  const tempM = value?.$d?.getMonth() + 1
                  const tempD = value?.$d?.getDate()
                  const regex = /^\d{4}-\d{1,2}-\d{1,2}$/
                  if (regex.test(tempY + '-' + tempM + '-' + tempD)) {
                    this.onChangedAddRow('支払日', value)
                  }
                }
                } />
              </div>
              <div className="flex addRow-input min-w-[110px] 勘定科目">
                <Select className="w-6/12 my-auto h-[34px] w-[110px]" value={(this.state.addRowData['勘定科目']) ? this.state.addRowData['勘定科目'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('勘定科目', event.target.value)} >
                  {
                    subjects.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <div className="flex addRow-input min-w-[110px] 支払口座/小口">
                <Select className="w-6/12 my-auto h-[34px] w-[110px]" value={(this.state.addRowData['支払口座/小口']) ? this.state.addRowData['支払口座/小口'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('支払口座/小口', event.target.value)} >
                  {
                    accounts.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>

              <input className="addRow-input" placeholder="支払先" value={this.state.addRowData['支払先']} onChange={(event) => this.onChangedAddRow('支払先', event.target.value)} />
              <input className="addRow-input" placeholder="内容" value={this.state.addRowData['内容']} onChange={(event) => this.onChangedAddRow('内容', event.target.value)} />
              <input className="addRow-input min-w-[110px]" placeholder="金額" type="number" value={this.state.addRowData['金額']} onChange={(event) => this.onChangedAddRow('金額', event.target.value)} />
              <input className="addRow-input min-w-[110px]" placeholder="経費対象" value={this.state.addRowData['経費対象']} onChange={(event) => this.onChangedAddRow('経費対象', event.target.value)} />
              <input className="addRow-input" placeholder="備考" value={this.state.addRowData['備考']} onChange={(event) => this.onChangedAddRow('備考', event.target.value)} />
              <div className="flex items-center justify-between addRow-input min-w-[110px] !pr-[10px]">
                <button className="flex items-center justify-center w-[20px] h-[20px] border-[1px] border-solid border-[#000]"
                  onClick={(event) => {
                    event.preventDefault()
                    this.setState({ isAddRow: true })
                    this.setState({ openRemoveModal: true })
                  }}>-</button>

                <div className="flex overflow-x-auto mt-[3px]">

                  {
                    this.state.addRowData['書類']?.map((file: string, index: number) => {
                      return (
                        <img key={"書類" + index} className="border-[1px] border-[#B1B1B1] rounded-[5px] cursor-pointer mr-[10px] mt-0" src={`assets/icons/File.svg`} width={30} height={30}
                          onClick={(event) => {
                            event.preventDefault()
                            this.setState({ isAddRow: true })
                            setTimeout(() => {
                              this.onViewFile(index)
                            }, 100)
                          }} />
                      )
                    })
                  }
                </div>

                <button className="flex items-center justify-center w-[20px] h-[20px] border-[1px] border-solid border-[#000]"
                  onClick={(event) => {
                    event.preventDefault()
                    this.setState({ isAddRow: true })
                    this.setState({ openAddModal: true })
                  }}>+</button>


              </div>
              <input className="addRow-input min-w-[110px]" placeholder="入力者" value={this.state.addRowData['入力者']} disabled />
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
          open={this.state.openAddModal}
          style={{
            position: 'absolute',
            margin: 'auto',
            height: 600,
            width: 625,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[11px]">
            <div className="flex w-full py-[10px] px-[40px] bg-primary rounded-t-[10px]">
              <h1 className="w-full font-Meiryo text-white text-[20px] my-auto font-bold">書類アップロード</h1>
            </div>
            <DragDropFile value={this.onChangeFiles} />
            <div className="flex justify-center absolute bottom-5 mx-auto w-full">
              <button className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-gray items-center"
                onClick={(e) => {
                  e.preventDefault()
                  this.setState({ openAddModal: false });
                }}
              >キャンセル</button>
              <button className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1 items-center"
                onClick={(e) => {
                  e.preventDefault()
                  this.onUploadFiles()
                }}
              >保  存</button>
            </div>
          </div>

        </Modal>
        <Modal
          open={this.state.openRemoveModal}
          style={{
            position: 'absolute',
            margin: 'auto',
            height: 476,
            width: 525,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[10px]">
            <div className="flex w-full h-[40px] px-[40px] bg-primary rounded-t-[10px]">
              <h1 className="font-Meiryo text-white text-[20px] my-auto font-bold">書類削除</h1>
            </div>
            <div className="h-[350px] w-full px-16 overflow-y-auto m-auto">
              {this.state.files &&
                this.state.files?.map((file: any, key: any) => {
                  return (
                    <div className="flex justify-between w-full mx-auto my-3" key={`書類削除${key}`}>
                      <div className="flex">
                        <div className="file-image">
                          <img src={`/assets/icons/File.svg`} alt="" />
                        </div>
                        <h5 className="my-auto">{`${file}`}</h5>
                      </div>
                      <img className="cursor-pointer" src="assets/icons/Close.svg"
                        onClick={(e) => {
                          e.preventDefault()
                          let files = this.state.files
                          files = files.filter((e: any) => e !== file);
                          this.setState({ files: files })
                        }} />
                    </div>
                  )
                })
              }

            </div>
            <div className="flex justify-center my-auto">
              <button className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-gray items-center"
                onClick={(e) => {
                  e.preventDefault()
                  this.setState({ openRemoveModal: false })
                }}
              >キャンセル</button>
              <button className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1 items-center"
                onClick={(e) => {
                  e.preventDefault()
                  this.onRemoveFiles()
                }}
              >保  存</button>
            </div>
          </div>

        </Modal>
        <Modal
          open={this.state.openViewModal}
          style={{
            position: 'absolute',
            margin: 'auto',
            height: 546,
            width: 700,
          }}
          onClose={() => {
            this.setState({ openViewModal: false });
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[10px]">

            <div className="flex justify-between m-auto items-center">
              <img className="mx-3 cursor-pointer" src="assets/icons/Left.svg" width={18} height={32}
                onClick={(e) => {
                  e.preventDefault()
                  this.prevFileView()
                }} />
              <div className="flex flex-col">
                <a href={`${this.state.fileURL}`} target="blank">
                  <img src={`assets/icons/File.svg`} width={600} height={400} />

                  <h5 className="font-Meiryo text-[14px] mt-3 w-full text-left">
                    {`${this.state.fileURL}`.split(')_')[1]}
                  </h5>
                </a>
              </div>
              <img className="mx-3 cursor-pointer" src="assets/icons/Right.svg" width={18} height={32}
                onClick={(e) => {
                  e.preventDefault()
                  this.nextFileView()
                }} />
            </div>

          </div>

        </Modal>
        <Modal
          className="min-w-[876px]"
          open={this.state.openDetailModal}
          style={{
            position: 'absolute',
            width: '50vw',
            margin: 'auto',
            height: '75vh',
          }}
          onClose={() => {
            this.setState({ openDetailModal: false })
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full border-none">
            <div className="flex w-full h-[70px] px-[40px] bg-[#BCD8F1] rounded-t-[20px]">
              <h1 className="font-Meiryo text-[20px] my-auto">経費詳細</h1>
            </div>
            <div className="bg-white p-10 overflow-y-auto rounded-b-[20px]">

              {/* No */}
              <div className="flex w-full">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">No</label>
                  <label className="w-6/12 my-auto">{this.state.modalRow?.['No']}</label>
                </div>
                <div className="flex w-full pr-5"></div>
              </div>

              {/* 計上月 & 支払日 */}
              <div className="flex w-full my-5">
                <div className="flex flex-cols w-full">
                  <label className="w-6/12 my-auto pl-10">計上月</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue date={this.state.modalRow?.['計上月']} onChange={(value: any) => {
                      const tempY = value?.$d?.getFullYear()
                      const tempM = value?.$d?.getMonth() + 1
                      const tempD = value?.$d?.getDate()
                      const regex = /^\d{4}-\d{1,2}-\d{1,2}$/
                      if (regex.test(tempY + '-' + tempM + '-' + tempD)) {
                        let data = this.state.modalRow
                        data['計上月'] = new Date(value.toLocaleString("ja-JP"));
                        this.setState({ modalRow: data })
                      }
                    }} />
                  </div>
                  <IconButton aria-label="cancel" className="!ml-[-10px]" onClick={() => this.onEraseDatePicker(1)}>
                    <CancelIcon />
                  </IconButton>
                </div>

                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">支払日</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue date={this.state.modalRow?.['支払日']} onChange={(value: any) => {
                      const tempY = value?.$d?.getFullYear()
                      const tempM = value?.$d?.getMonth() + 1
                      const tempD = value?.$d?.getDate()
                      const regex = /^\d{4}-\d{1,2}-\d{1,2}$/
                      if (regex.test(tempY + '-' + tempM + '-' + tempD)) {
                        let data = this.state.modalRow
                        data['支払日'] = new Date(value.toLocaleString("ja-JP"));
                        this.setState({ modalRow: data })
                      }
                    }} />
                  </div>
                  <IconButton aria-label="cancel" className="!ml-[-10px]" onClick={() => this.onEraseDatePicker(2)}>
                    <CancelIcon />
                  </IconButton>
                </div>
              </div>


              {/* 勘定科目 & 支払口座 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">勘定科目</label>
                  <Select className="w-6/12 my-auto h-[34px]" id="勘定科目"
                    value={this.state.modalRow?.['勘定科目']}
                    onChange={(event: SelectChangeEvent) => {
                      let data = this.state.modalRow
                      data['勘定科目'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      subjects.map((item, key) => {
                        return (
                          <MenuItem value={`${item.value}`} key={`勘定科目${key}`}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>

                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">支払口座</label>
                  <Select className="w-6/12 my-auto h-[34px]" id="支払口座"
                    value={this.state.modalRow?.['支払口座/小口']}
                    onChange={(event: SelectChangeEvent) => {
                      let data = this.state.modalRow
                      data['支払口座/小口'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      accounts.map((item, key) => {
                        return (
                          <MenuItem value={`${item.value}`} key={`支払口座/小口${key}`}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>



              </div>

              {/* 支払先 & 内容 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">支払先</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['支払先']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['支払先'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">内容</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['内容']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['内容'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* 金額 & 経費対象 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">金額</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['金額']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['金額'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">経費対象</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['経費対象']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['経費対象'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* 備考 */}
              <div className="flex w-6/12 my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">備考</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['備考']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['備考'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              <div className="flex w-full my-5">
                <label className="w-3/12 my-auto pl-10">備考</label>
                <div className="w-9/12 my-auto">
                  <div className="w-7/12 my-auto">
                    <div className="max-h-[200px] overflow-y-auto">
                      {this.state.files && this.state.files?.map((file: any, key: any) => {
                        let _file = (typeof file == "string") ? file.slice(18, 58) : "";
                        return (
                          <div className="flex justify-between w-full mx-auto my-3" key={`備考${key}`}>
                            <div className="flex">
                              <div className="file-image">
                                <img src={`/assets/icons/File.svg`} alt="" />
                              </div>
                              <h5 className="my-auto">{`${_file}`}</h5>
                            </div>
                            <img className="cursor-pointer" src="assets/icons/Close.svg"
                              onClick={(e) => {
                                e.preventDefault()
                                let files = this.state.files
                                files = files.filter((e: any) => e !== file);
                                this.setState({ files: files })
                              }} />
                          </div>
                        )
                      }
                      )}
                    </div>

                    <div className="flex justify-evenly text-[12px] border border-[#24BFF2] bg-[#BCD8F1] rounded-[22px] w-[130px] h-[25px] my-2 justify-center text-center font-Meiryo cursor-pointer"
                      onClick={() => {
                        this.setState({ openAddModal: true })
                      }}>
                      <span className="flex items-center w-[16px] h-[16px] border rounded-[5px] justify-center text-center my-auto">+</span>
                      <span className="my-auto">アップロード</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* History */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">変更履歴 </label>
                <div className="w-9/12 border-solid border-[0.6px] border-[#c4c4c4] rounded-[5px] overflow-y-auto p-3 h-[150px]">
                  {
                    this.state.historyData?.map((element: any, key: any) => {
                      return (
                        <div key={`変更履歴${key}`}>
                          {element.updatedAt} : {element.updatedByUsername}<br />
                          {element.field} : {element.oldValue == '1/1/1970' ? '空' : element.oldValue} &rarr; {element.newValue == '1/1/1970' ? '空' : element.newValue} <br /><hr /><br />
                        </div>
                      )
                    })
                  }

                </div>
              </div>

              <div className="flex justify-center mx-auto w-full">
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-gray" onClick={(e) => {
                  e.preventDefault();
                  this.setState({ openDetailModal: false })

                  const index = parseInt(localStorage.getItem('old_modal_rowIndex'), 10);
                  const old_modal_data = JSON.parse(localStorage.getItem('old_modal_data'));

                  if (old_modal_data['計上月'] == '') {
                    old_modal_data['計上月'] = null;
                  }
                  if (old_modal_data['支払日'] == '') {
                    old_modal_data['支払日'] = null;
                  }

                  let data = this.state.data
                  data[index] = old_modal_data;

                  this.grid.notifyInsertItem(index, old_modal_data);

                }} >キャンセル</button>
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1" onClick={(e) => { e.preventDefault(); this.onSaveDetailModal() }}>保  存</button>
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

    // all
    let filterOperand = new IgrFilterOperand();
    let column = this.grid.actualColumns.item(5);
    filterOperand.editorType = EditorType.Text;

    filterOperand.displayName = "口座/小口";
    filterOperand.filterRequested = this.onFilter_all;
    column.filterOperands.add(filterOperand);
    // 成約
    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "口座";
    filterOperand.filterRequested = this.onFilter_success;
    column.filterOperands.add(filterOperand);
    // 不成約
    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "小口";
    filterOperand.filterRequested = this.onFilter_failure;
    column.filterOperands.add(filterOperand);

  }

  public onFilter_all = (s: IgrFilterOperand, args: IgrGridCustomFilterRequestedEventArgs) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isNotEqualTo(".");
  }

  public onFilter_success = (s: IgrFilterOperand, args: IgrGridCustomFilterRequestedEventArgs) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isEqualTo("口座");
  }

  public onFilter_failure = (s: IgrFilterOperand, args: IgrGridCustomFilterRequestedEventArgs) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isEqualTo("小口");
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
      // } else if (e.cellInfo.rowItem['操作'] == 2) {
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

  public onFileCellUpdating = (s: IgrTemplateColumn, e: IgrTemplateCellUpdatingEventArgs) => {

    const content = e.content as HTMLDivElement;
    content.style.display = 'flex'
    content.style.justifyContent = 'space-between'


    let removeBtn: HTMLInputElement | null = null;
    let addBtn: HTMLInputElement | null = null;
    content.innerHTML = ""
    if (content.childElementCount === 0) {

      removeBtn = document.createElement('input')
      removeBtn.value = '-'
      removeBtn.type = 'button'

      removeBtn.style.width = '20px'
      removeBtn.style.height = '20px'
      removeBtn.style.verticalAlign = 'middle'
      removeBtn.style.borderWidth = '1px'
      removeBtn.style.borderRadius = '5px'
      removeBtn.style.lineHeight = 'initial'
      removeBtn.style.cursor = 'pointer'
      removeBtn.style.marginTop = '10px'

      removeBtn.onclick = event => {
        event.preventDefault()
        this.setState({ files: e.cellInfo.rowItem['書類'] })
        this.setState({ openRemoveModal: true })
      }

      content.appendChild(removeBtn)

    } else {
      removeBtn = content.children[0] as HTMLInputElement;
    }

    let imgContent: HTMLDivElement | null = null;
    imgContent = document.createElement('div')
    imgContent.style.display = 'flex'
    imgContent.style.width = '220px'
    imgContent.style.overflowX = 'auto'
    imgContent.style.marginTop = '3px'
    // imgContent.style.justifyContent = 'space-between'

    const info = e.cellInfo as IgrTemplateCellInfo;
    const item = info.rowItem;
    const images = item['書類'];

    for (let i = 0; i < images.length; i++) {

      let imgTag: HTMLImageElement | null = null;
      imgTag = document.createElement('img')

      if (imgContent.childElementCount === i) {

        imgTag.src = `assets/icons/File.svg`
        imgTag.style.width = '30px'
        imgTag.style.height = '30px'
        imgTag.style.borderWidth = '1px'
        imgTag.style.borderColor = '#B1B1B1'
        imgTag.style.borderRadius = '5px'
        imgTag.style.cursor = 'pointer'
        imgTag.style.marginTop = '0px'
        imgTag.style.marginRight = '10px'

        imgTag.onclick = e => {
          e.preventDefault()
          this.onViewFile(i)
        }

        imgContent.appendChild(imgTag)

      } else {

        imgTag = imgContent.children[i] as HTMLImageElement

      }

    }

    if (content.childElementCount < 2) {

      content.appendChild(imgContent)

    } else {

      imgContent = content.children[1] as HTMLDivElement;

    }

    if (content.childElementCount < 3) {

      addBtn = document.createElement('input')
      addBtn.value = '+'
      addBtn.type = 'button'

      addBtn.style.width = '20px'
      addBtn.style.height = '20px'
      addBtn.style.display = 'flex'
      addBtn.style.cursor = 'pointer'
      addBtn.style.marginTop = '10px'
      addBtn.style.lineHeight = '20px'
      addBtn.style.borderWidth = '1px'
      addBtn.style.borderRadius = '5px'
      addBtn.style.verticalAlign = 'middle'
      addBtn.style.justifyContent = 'center'

      addBtn.onclick = e => {
        e.preventDefault()
        this.setState({ openAddModal: true });
      }

      content.appendChild(addBtn)

    } else {
      addBtn = content.children[2] as HTMLInputElement;
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
    e.cellInfo.rowItem['操作'] = 0

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
    e.cellInfo.rowItem['操作'] = 2
    //save changed value
    if (e.cellInfo.rowItem['id']) {
      const res = await api.store.updateExpense(e.cellInfo.rowItem['id'], e.cellInfo.rowItem)

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

      const res_history = await api.store.updateExpenseHistory(e.cellInfo.rowItem['id'], ownHistoryData)

      this.changedHistoryData = otherHistoryData

    } else {
      const res = await api.store.createExpense(e.cellInfo.rowItem)
    }
  }

  //delete selected row
  public onDeleteRow = async () => {
    // Make a copy of data array
    let data = [...this.state.data]

    this.activeRowIndex = this.grid.activeCell.rowIndex;

    const row = data[this.activeRowIndex]

    const res = await api.store.deleteExpense(row['id'])

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ openDeleteModal: false })
  }

  //add new row
  public onAddRow = () => {

    const new_data = { 'No': this.state.lastIndex, '計上月': new Date(), '支払日': new Date(), '勘定科目': '', '支払口座/小口': '', '支払先': '', '内容': '', '金額': 0, '経費対象': '', '備考': '', '書類': [] as any, '操作': 1, }
    this.setState({ addRowData: new_data })
    this.setState({ addRowHidden: true })
    this.grid.scrollTo(0, 10000000)
  }

  public handleScroll = (event: any) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    this.grid.scrollTo(scrollLeft, 10000000)
  }

  public onChangedAddRow = (field: string, value: any) => {
    let data = this.state.addRowData

    if (field == '計上月' || field == '支払日') {

      const isoString = value.toISOString(); // Outputs "2022-01-01T00:00:00.000Z"
      const jstDateObj = new Date(isoString);
      const jstString = jstDateObj.toLocaleString("ja-JP", { year: 'numeric', month: '2-digit', day: '2-digit' });
      data[field] = jstString

    } else
      data[field] = value

    this.setState({ addRowData: data })
  }

  public onAddRowSave = async () => {
    try {
      const res = await api.store.createExpense(this.state.addRowData)
      if (res.status == 201) {

        let data = this.state.data
        let temp = this.state.addRowData
        temp['id'] = res.data.id
        data.push(temp)
        this.grid.notifyInsertItem(data.length - 1, this.state.addRowData)
        this.setState({ total: this.state.total + 1 })
        toast.success('保存されました。')
      } else {
        toast.error('保存が失敗しました。')
      }
    } catch (err) {
      toast.error('予期しないエラー発生しました。')
    }

    this.setState({ isAddRow: false })
    this.setState({ addRowHidden: false })

  }

  public onAddRowCancel = () => {
    this.setState({ isAddRow: false })
    this.setState({ addRowHidden: false })
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

  public onKeyUp = async (event: any) => {
    if (this.grid.activeCell == null || this.state.copiedRow == null) return;

    let data = this.state.data; // Make a copy of data array

    if ((event.ctrlKey) && event.code === 'KeyV') {

      console.log('PASETD')

      if (!this.state.isAddRowFocused) {

        this.activeRowIndex = this.grid.activeCell.rowIndex;
        const rowId = data[this.activeRowIndex]['id'];
        const rowNo = data[this.activeRowIndex]['No'];
        const rowDate = data[this.activeRowIndex]['計上月'];

        // Remove the original row from the array
        data.splice(this.activeRowIndex, 1);

        // Create a new object with the copied row data
        const newRowData = { ...this.state.copiedRow };
        newRowData['id'] = rowId
        newRowData['No'] = rowNo
        newRowData['計上月'] = rowDate
        newRowData['操作'] = 1

        // Insert the new row at the active row index
        data.splice(this.activeRowIndex, 0, newRowData);

        this.setState({ data: data });
        this.grid.notifyInsertItem(this.activeRowIndex, 1);

        //set history
        let obj = {} as any

        obj['field'] = 'コピー済み'
        obj['product_number'] = rowNo
        obj['old_value'] = 'No' + this.state.copiedRow['No']
        obj['new_value'] = 'No' + rowNo
        obj['username'] = this.userName

        this.changedHistoryData.push(obj)

      } else {

        const addRowData = this.state.addRowData
        const productNo = addRowData['No']
        const registerDT = addRowData['計上月']

        const newRowData = { ...this.state.copiedRow };
        newRowData['No'] = productNo
        newRowData['計上月'] = registerDT

        //set temp files with coping files at added row newly        
        if (newRowData['書類'].length > 0) {

          const files = newRowData['書類']
          const res = await api.store.setTempFile({ files: files })

          if (res.status == 200) {
            newRowData['書類'] = res.data.newFileNames;
          }
        }

        this.setState({ addRowData: newRowData })
        this.setState({ isAddRowFocused: false })
        this.setState({ copiedRow: null })
      }

    }
  }

  public handlClick = async (event: any) => {
    this.setState({ isAddRowFocused: true })
  }

  //open detail modal
  public onOpenDetailModal = async (row: any) => {

    const rowIndex = this.grid.activeCell.rowIndex

    localStorage.setItem('old_modal_rowIndex', rowIndex.toString());
    localStorage.setItem('old_modal_data', JSON.stringify(this.grid.dataSource[rowIndex]));

    this.setState({ files: this.grid.dataSource[rowIndex]['書類'] })
    this.setState({ modalRow: this.grid.dataSource[rowIndex] })
    this.setState({ openDetailModal: true })
    //get history
    const id = this.grid.dataSource[rowIndex]['id']

    this.rowIndex = rowIndex
    this.new_modal_data = this.grid.dataSource[rowIndex]
    const res = await api.store.getExpenseHistory(id)

    this.setState({ historyData: res.data.data })
  }

  public onSaveDetailModal = async () => {
    let data = this.state.modalRow
    const rowIndex = this.grid.activeCell.rowIndex
    const rowId = this.grid.dataSource[this.rowIndex]?.id
    //save changed value
    if (this.state.modalRow['id']) {

      data['書類'] = this.state.files
      // data['書類'] = this.state.data[rowIndex]['書類']
      const res = await api.store.updateExpense(this.state.modalRow['id'], data)
    } else {
      const res = await api.store.createExpense(this.state.modalRow)
    }

    this.grid.notifySetItem(this.rowIndex, this.new_modal_data, data)
    this.setState({ openDetailModal: false })
  }

  public onViewFile = (fileId: any) => {

    let fileURL: any

    if (this.state.isAddRow) {
      const files = this.state.addRowData['書類']
      fileURL = this.FILE_PATH + 'temp/' + files[fileId]
    } else {
      const rowIndex = this.grid.activeCell.rowIndex
      const files = this.grid.dataSource[rowIndex]['書類']
      fileURL = this.FILE_PATH + files[fileId]
    }

    this.setState({ fileURLID: fileId });
    this.setState({ fileURL: fileURL });
    this.setState({ openViewModal: true });
  }

  public nextFileView = () => {

    let files: any
    let fileId: any

    if (this.state.isAddRow) {
      files = this.state.addRowData['書類']
      fileId = this.state.fileURLID + 1
    } else {
      const rowIndex = this.grid.activeCell.rowIndex
      files = this.grid.dataSource[rowIndex]['書類']
      fileId = this.state.fileURLID + 1
    }

    if (fileId == files.length) this.onViewFile(0)
    else this.onViewFile(fileId)

  }

  public prevFileView = () => {
    let files: any
    let fileId: any

    if (this.state.isAddRow) {
      files = this.state.addRowData['書類']
      fileId = this.state.fileURLID - 1
    } else {
      const rowIndex = this.grid.activeCell.rowIndex
      files = this.grid.dataSource[rowIndex]['書類']
      fileId = this.state.fileURLID - 1
    }

    if (fileId < 0) this.onViewFile(files.length - 1)
    else this.onViewFile(fileId)
  }

  public onUploadFiles = async () => {
    this.setState({ loading: true })
    let rowId: any
    let rowIndex: number
    let uploadFile = {} as any

    if (this.state.openDetailModal) uploadFile = this.state.tempFiles
    else uploadFile = this.state.files

    if (this.state.isAddRow) rowId = 'isAddRow'
    else {
      rowIndex = this.grid.activeCell.rowIndex
      rowId = this.grid.dataSource[rowIndex]?.id
    }

    await api.store.fileUpload({ id: rowId, files: this.state.files }).then((response: any) => {
      // Handle the response
      if (response.data.success === true) {
        if (this.state.isAddRow) {

          let rowData = this.state.addRowData
          rowData['書類'] = rowData['書類']?.concat(response.data.data)

          this.setState({ files: rowData['書類'] })
          this.setState({ addRowData: rowData })

        } else {

          let data = this.state.data
          data[rowIndex]['書類'] = response.data.data
          this.setState({ data: data })
          this.setState({ files: data[rowIndex]['書類'] })
          this.grid.notifyInsertItem(rowIndex, 1);
        }

        this.setState({ isAddRow: false })
        this.setState({ loading: false })

        toast.success('書類アップロードに成功しました！');
        this.setState({ openAddModal: false });

      }

    });
  }

  public onChangeFiles = (value: any) => {
    this.setState({ files: value })
  }

  public onRemoveFiles = async () => {
    let rowId: any
    let rowIndex: number

    if (this.state.isAddRow) rowId = 'isAddRow'
    else {
      rowIndex = this.grid.activeCell.rowIndex
      rowId = this.grid.dataSource[rowIndex]?.id
    }

    await api.store.fileRemove({ id: rowId, files: this.state.files }).then((response: any) => {
      // Handle the response
      if (response.data.success === true) {
        this.setState({ openRemoveModal: false });

        if (this.state.isAddRow) {
          let rowData = this.state.addRowData
          rowData['書類'] = response.data.data
          this.setState({ addRowData: rowData })
        }
        else {

          let data = this.state.data
          data[rowIndex]['書類'] = response.data.data
          this.setState({ data: data })
          this.grid.notifyInsertItem(rowIndex, 1);
        }
      }

    });

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
      const worksheet = workbook.Sheets['経費一覧'];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const final_results = [] as any;
      jsonData.forEach((element: any, index) => {
        if (index > 0 && element[3]) {
          final_results.push({
            'No': index,
            '店舗名': storeName,
            '計上月': element[2] ? this.convertDate(element[2]) : '',
            '支払日': element[3] != '未払計上' ? this.convertDate(element[3]) : '',
            '勘定科目': element[4] ? element[4] : '',
            '支払口座/小口': element[5] ? element[5] : '',
            '支払先': element[6] ? element[6] : '',
            '内容': element[7] ? element[7] : '',
            '金額': element[8] ? element[8] : '',
            '経費対象': element[9] ? element[9] : '',
            '備考': element[10] ? element[10] : '',
            '書類': [],
          });
        }
      });

      await api.store.csvUploadExpense(final_results).then((response: any) => {
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
          key != "操作" &&
          key != "v" &&
          key != "No"
        ) {
          if (index == 0) {
            if (key == "no") title.push("No")
            else title.push(key)
          }
          switch (key) {
            case "金額":
              arr.push(this.currencyFormatter(value as number))
              // arr.push("¥ " + value)
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

