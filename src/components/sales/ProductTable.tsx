import React from "react";
import api from "src/api";
import ReactDOM from "react-dom";
import Modal from '@material-ui/core/Modal';
import Papa, { ParseResult } from 'papaparse';
import { ToastContainer, toast } from 'react-toastify';
import DragDropImage from "src/components/DragDropImage";
import { DatePickerValue } from "src/components/DatePicker";
import { TimePickerValue } from "src/components/TimePicker";
import { MenuItem, Box, Button, TextField, Select } from "@mui/material";
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
  IIgrCellTemplateProps,
} from 'igniteui-react-grids';


// importing localization data:
import { IMAGE_PATH } from "src/configs/AppConfig";
import { Localization } from 'igniteui-react-core';
import { contracts, productA, productB, brands, ranks } from 'src/constants/SalesOptions';
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();


export default class ProductTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;
  public addRowData: any = null;

  //set value
  public IMAGE_PATH = IMAGE_PATH;
  public userName = localStorage.getItem('userName');

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40

  // pointer track
  public pointer = 0;
  public PAGE_SIZE = 1000; // Define the number of records to load per page
  public tempData: any[] = []
  public Request_Status = 0;
  public old_modal_data = {} as any
  public rowIndex = 0

  //date format
  public formatter = new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Tokyo',
  });

  constructor(props: any) {

    super(props);

    this.onGetData();

    this.state = {
      time: null,
      data: [],
      images: [],
      loading: true,
      tempImages: null,
      copiedRow: null,
      historyData: null,
      copiedRowIndex: null,

      addRowData: {},
      isAddRow: false,
      addRowHidden: false,
      lastIndex: 1,

      modalRow: null,
      modalImages: [],
      modalComments: [],
      isModalRow: false,

      imageURL: null,
      imageURLID: null,
      imageComment: null,
      openAddModal: false,
      openViewModal: false,
      openRemoveModal: false,
      openDetailModal: false,
      openDeleteModal: false,

      total: 0
    }

    Localization.register("DataGrid-ja", new DataGridLocalizationJa());
    Localization.register("DataVisualization-ja", new DataGridSummariesLocalizationJa());
    Localization.register("Calendar-ja", new DataGridDateTimeColumnLocalizationJa());
    Localization.register("MultiColumnComboBox-ja", new DataGridMultiColumnComboBoxLocalizationJa());

    this.handlKeyDown = this.handlKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handlKeyDown);
  }

  componentWillUnmount() {
    document.addEventListener('keydown', this.handlKeyDown);
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
      dataName: 'product',
      pointertrack: this.pointer,
      count: this.PAGE_SIZE,
    };
    // loading params end
    const res = await api.client.getProduct(params)
    if (res.data.lastIndex != 1) {
      this.setState({ lastIndex: res.data.lastIndex + 1, total: res.data.total })
    }
    const temp = res.data.data
    this.Request_Status = temp.length

    let changedTypeData: any[] = []

    temp.forEach((item: any) => {

      item['ステイタス'] = item['ステイタス'] ? item['ステイタス'] : ''
      item['日付'] = item['日付'] ? new Date(item['日付']) : null
      item['商品種別A'] = item['商品種別a'] ? item['商品種別a'] : ''
      item['商品種別B'] = item['商品種別b'] ? item['商品種別b'] : ''
      item['ブランド'] = item['ブランド'] ? item['ブランド'] : ''
      item['商品名'] = item['商品名'] ? item['商品名'] : ''
      item['説明'] = item['説明'] ? item['説明'] : ''
      item['画像'] = item['画像'] ? item['画像'] : []
      item['URL'] = item['url'] ? item['url'] : ''
      item['卸先名'] = item['卸先名'] ? item['卸先名'] : ''
      item['最低価格'] = item['最低価格'] ? item['最低価格'] : 0
      item['最高価格'] = item['最高価格'] ? item['最高価格'] : 0
      item['操作'] = 2
      changedTypeData.push(item)
    })

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
          <Box className="flex flex-row justify-end gird-header">
            <div
              className="align-middle rounded-tl-lg rounded-tr-lg inline-block w-full px-4 py-4 overflow-hidden !bg-transparent">
              <div className="flex justify-between">
                検索結果 &nbsp;&nbsp;{this.state.total} 件
              </div>
            </div>
            <IgrDataGridToolbar ref={this.onToolbarRef} columnChooser="true" />
            {/* <input
              accept=".csv"
              id="csv-file"
              type="file"
              style={{ display: 'none' }}
              onChange={this.onUploadCSV}
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
                bgcolor: '#0066FF',
                border: 1,
                borderColor: '#24BFF2',
                borderRadius: 22,
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                marginRight: 0.5,
              }}>
                EXCELアップロード
              </Button>              
            </label> */}
            <Button component="span" sx={{
              minWidth: 160,
              height: 34,
              color: '#fff !important',
              ":hover": {
                color: '#000 !important',
              },
              fontFamily: 'Meiryo',
              bgcolor: '#0066FF',
              border: 1,
              borderColor: '#24BFF2',
              borderRadius: 22,
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
              marginRight: 0.5,
            }}
              onClick={(event) => {
                event.preventDefault()
                this.onExportExcel("売上表")
              }}>
              Excelダウンロード
            </Button>
          </Box>

          <div className="flex flex-col relative igr-table h-full">
            {/* Table */}
            <IgrDataGrid
              ref={this.onGridRef}
              dataSource={this.state.data}

              editMode={0}
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
              activeCellChanged={this.onActiveCellChange}

              // isPagerVisible="true"
              // pageSize="10"
              // cellValueChanging={}
              // editOnKeyPress={false}

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
              <IgrComboBoxColumn field="ステイタス" dataSource={contracts} dataBound={this.onCellDataBound} />
              <IgrDateTimeColumn field="日付" dataBound={this.onCellDataBound} formatOverride={this.formatter} width={'*>180'} />
              <IgrComboBoxColumn field="商品種別A" dataSource={productA} dataBound={this.onCellDataBound} />
              <IgrComboBoxColumn field="商品種別B" dataSource={productB} dataBound={this.onCellDataBound} />
              <IgrTextColumn field="商品名" dataBound={this.onCellDataBound} />
              <IgrComboBoxColumn field="ブランド" dataSource={brands} dataBound={this.onCellDataBound} />
              <IgrTextColumn field="説明" dataBound={this.onCellDataBound} />
              <IgrTemplateColumn field="画像" cellUpdating={this.onImageCellUpdating} width={`*>${this.imgColumnWidth}`} dataBound={this.onCellDataBound} />
              <IgrComboBoxColumn field="URL" dataSource={ranks} dataBound={this.onCellDataBound} />
              <IgrTextColumn field="卸先名" dataBound={this.onCellDataBound} />
              <IgrNumericColumn field="最低価格" positivePrefix="¥" dataBound={this.onCellDataBound} showGroupingSeparator="true" />
              <IgrNumericColumn field="最高価格" positivePrefix="¥" dataBound={this.onCellDataBound} showGroupingSeparator="true" />
              <IgrTemplateColumn field="操作" width={'*>150'} pinned='right' cellUpdating={this.onActionCellUpdating} dataBound={this.onCellDataBound} />
            </IgrDataGrid>

            {/* Bottom Button */}
            <div className={`flex ${!this.state.addRowHidden && 'hidden'} absolute overflow-x-auto overflow-y-hidden w-full bottom-11`} onScroll={this.handleScroll}>
              <div className="flex addRow-input min-w-[150px] ステイタス">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['ステイタス']) ? this.state.addRowData['ステイタス'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('ステイタス', event.target.value)} >
                  {
                    contracts.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <div className="flex addRow-input min-w-[180px] 日付"><DatePickerValue date={this.state.addRowData['日付']} onChange={(value: any) => this.onChangedAddRow('日付', value)} /></div>

              <div className="flex addRow-input min-w-[150px] 商品種別A">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['商品種別A']) ? this.state.addRowData['商品種別A'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('商品種別A', event.target.value)}>
                  {
                    productA.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <div className="flex addRow-input min-w-[150px] 商品種別B">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['商品種別B']) ? this.state.addRowData['商品種別B'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('商品種別B', event.target.value)}>
                  {
                    productB.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <input className="addRow-input" placeholder="商品名" value={this.state.addRowData['商品名']} onChange={(event) => this.onChangedAddRow('商品名', event.target.value)} />
              <div className="flex addRow-input min-w-[150px] ブランド">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['ブランド']) ? this.state.addRowData['ブランド'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('ブランド', event.target.value)}>
                  {
                    brands.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <input className="addRow-input" placeholder="説明" value={this.state.addRowData['説明']} onChange={(event) => this.onChangedAddRow('説明', event.target.value)} />
              <div className="flex items-center justify-between addRow-input min-w-[300px] 画像">
                <button className="flex items-center justify-center w-[20px] h-[20px] border-[1px] border-solid border-[#000]"
                  onClick={(event) => {
                    event.preventDefault()
                    this.setState({ isAddRow: true })
                    this.setState({ openRemoveModal: true })
                  }}>-</button>

                <div className="flex w-[220px] overflow-x-auto mt-[3px]">

                  {
                    this.state.addRowData['画像']?.map((image: string, index: number) => {
                      return (
                        <img key={"画像" + index} className="border-[1px] border-[#B1B1B1] rounded-[5px] cursor-pointer mr-[10px] mt-0" src={`${this.IMAGE_PATH}temp/${image}`} width={30} height={30}
                          onClick={(event) => {
                            event.preventDefault()
                            this.setState({ isAddRow: true })
                            setTimeout(() => {
                              this.onViewImage(index)
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
              <div className="flex addRow-input min-w-[150px]">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['URL']) ? this.state.addRowData['URL'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('URL', event.target.value)}>
                  {
                    ranks.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div>
              <input className="addRow-input" placeholder="卸先名" value={this.state.addRowData['卸先名']} onChange={(event) => this.onChangedAddRow('卸先名', event.target.value)} />
              <input className="addRow-input" placeholder="最低価格" type="number" value={this.state.addRowData['最低価格']} onChange={(event) => this.onChangedAddRow('最低価格', event.target.value)} />
              <input className="addRow-input" placeholder="最高価格" type="number" value={this.state.addRowData['最高価格']} onChange={(event) => this.onChangedAddRow('最高価格', event.target.value)} />
              <div className="addRow-input !w-[16.6%] h-[35px] flex" placeholder="入力者" >
                <Button className="flex addBtn " sx={{
                  height: 27,
                  color: '#FFFFFF',
                  fontFamily: 'Meiryo',
                  borderRadius: 5,
                  background: '#808080',
                  cursor: "pointer",
                  margin: "auto",
                }}
                  onClick={this.onAddRowCancel}
                >キャンセル</Button>
                <Button className="flex addBtn " sx={{
                  height: 27,
                  color: '#FFFFFF',
                  fontFamily: 'Meiryo',
                  borderRadius: 5,
                  background: '#0066FF',
                  cursor: "pointer",
                  margin: "auto",
                }}
                  onClick={this.onAddRowSave}
                >保 存</Button>
              </div>
            </div>
            {!this.state.addRowHidden ?
              <Button className="flex mt-2 addBtn" sx={{
                width: 93,
                height: 37,
                color: '#1A1A1A',
                fontFamily: 'Meiryo',
                borderRadius: 8,
                bgcolor: '#E6E6E6',
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
                  bgcolor: '#0066FF',
                }}
                  onClick={this.onAddRowSave}
                >保 存</Button>
                <Button className="flex addBtn !ml-2" sx={{
                  width: 93,
                  height: 37,
                  color: '#FFF',
                  fontFamily: 'Meiryo',
                  borderRadius: 8,
                  bgcolor: '#808080',
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
              <h1 className="w-full font-Meiryo text-white text-[20px] my-auto font-bold">画像アップロード</h1>
            </div>
            <DragDropImage value={this.onChangeImages} />
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
                  this.onUploadImages()
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
              <h1 className="font-Meiryo text-white text-[20px] my-auto font-bold">画像削除</h1>
            </div>
            <div className="h-[350px] w-full px-16 overflow-y-auto m-auto">
              {this.state.images &&
                this.state.images?.map((image: any, key: any) => {
                  return (
                    <div className="flex justify-between w-full mx-auto my-3" key={"画像削除" + key}>
                      <div className="flex">
                        <div className="file-image">
                          <img src={`${this.IMAGE_PATH}${this.state.isAddRow ? 'temp/' : ''}${image}`} alt="" width={32} height={32} />
                        </div>
                        <h5 className="my-auto">{`${image}`}</h5>
                      </div>
                      <img className="cursor-pointer" src="assets/icons/Close.svg"
                        onClick={(e) => {
                          e.preventDefault()
                          let images = this.state.images
                          images = images.filter((e: any) => e !== image);
                          this.setState({ images: images })
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
                  this.onRemoveImages()
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
            this.setState({ isAddRow: false })
            this.setState({ openViewModal: false })
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[10px]">

            <div className="flex justify-between m-auto items-center">
              <img className="mx-3 cursor-pointer" src="assets/icons/Left.svg" width={18} height={32}
                onClick={(e) => {
                  e.preventDefault()
                  this.prevImageView()
                }} />
              <div className="flex flex-col">
                <img src={`${this.state.imageURL}`} className="w-[600px] h-[400px]" />
                <h5 className="font-Meiryo text-[14px] mt-3 w-full text-center">{`${this.state.imageComment}`}</h5>
              </div>
              <img className="mx-3 cursor-pointer" src="assets/icons/Right.svg" width={18} height={32}
                onClick={(e) => {
                  e.preventDefault()
                  this.nextImageView()
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
            height: '90vh',
          }}
          onClose={() => {
            this.setState({ openDetailModal: false })
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full border-none">
            <div className="flex w-full p-[20px] bg-[#BCD8F1] rounded-t-[20px]">
              <h1 className="font-Meiryo text-[20px] my-auto">商品詳細</h1>
            </div>
            <div className="bg-white p-10 overflow-y-auto rounded-b-[20px]">
              <h1 className="font-Meiryo text-[16px] my-auto font-bold mb-10">商品情報</h1>

              {/* No & Contract */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">ステイタス</label>
                  <Select className="w-8/12 my-auto h-[34px]"
                    value={(this.state.modalRow?.['ステイタス']) ? this.state.modalRow?.['ステイタス'] : ""}
                    onChange={(event: any) => {
                      event.preventDefault()
                      let data = this.state.modalRow
                      data['ステイタス'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      contracts.map((item: any, key: number) => {
                        return (
                          <MenuItem key={item.value} value={item.value} onClick={(e) => { e.preventDefault() }}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">日付時</label>
                  <div className="w-8/12 my-auto">
                    <DatePickerValue date={this.state.modalRow?.['日付']} onChange={(value: any) => {
                      let data = this.state.modalRow
                      data['日付'] = new Date(value.toLocaleString("ja-JP"));
                      this.setState({ modalRow: data })
                    }} />
                  </div>
                </div>
              </div>

              {/* ProductA & ProductB */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">商品種別A</label>
                  <Select className="w-8/12 my-auto h-[34px]"
                    value={(this.state.modalRow?.['商品種別A']) ? this.state.modalRow?.['商品種別A'] : ""}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['商品種別A'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      productA.map((item: any, key: number) => {
                        return (
                          <MenuItem value={`${item.value}`} key={`productA-${key}`}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">商品種別B</label>
                  <Select className="w-8/12 my-auto h-[34px]"
                    value={(this.state.modalRow?.['商品種別B']) ? this.state.modalRow?.['商品種別B'] : ""}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['商品種別B'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      productB.map((item: any, key: number) => {
                        return (
                          <MenuItem value={`${item.value}`} key={`productB-${key}`}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>
              </div>

              {/* Brand & Series */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">ブランド</label>
                  <Select className="w-8/12 my-auto h-[34px]"
                    value={(this.state.modalRow?.['ブランド']) ? this.state.modalRow?.['ブランド'] : ""}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['ブランド'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      brands.map((item: any, key: number) => {
                        return (
                          <MenuItem value={`${item.value}`} key={`brands-${key}`}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">商品名</label>
                  <TextField className="w-8/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['商品名']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['商品名'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  />
                </div>
              </div>

              {/* Image & Context */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-2/12 pl-10">画像</label>
                  <div className="flex flex-col w-10/12">
                    <div className="max-h-[200px] overflow-y-auto">
                      {/* image */}
                      {
                        this.state.modalRow?.['画像'].map((image: any, key: number) => {
                          let img = (typeof image == "string") ? image.slice(19, 58) : "";
                          return (
                            <div className="flex justify-between w-full mx-auto my-3" key={`images-${key}`}>
                              <div className="flex w-4/12">
                                <div className="file-image">
                                  <img src={`${this.IMAGE_PATH}${image}`} alt="" />
                                </div>
                                <h5 className="my-auto">{`${img}`}</h5>
                              </div>
                              <TextField className="w-8/12 my-auto"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: 34,
                                  },
                                }}
                                placeholder="画像フリーコメント"
                                value={this.state.modalRow['画像フリーコメント'][key] || ""}
                                onChange={(event: any) => {
                                  let modalRow = this.state.modalRow
                                  modalRow['画像フリーコメント'][key] = event.target.value
                                  this.setState({ modalRow: modalRow })
                                }} />
                              {this.state.modalRow?.操作 == 2 &&
                                <img className="cursor-pointer" src="assets/icons/Close.svg"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    let modalRow = this.state.modalRow
                                    modalRow['画像'].splice(key, 1)
                                    modalRow['画像フリーコメント'].splice(key, 1)
                                    this.setState({ modalRow: modalRow })
                                  }} />
                              }
                            </div>
                          )
                        })
                      }
                      {
                        this.state.modalImages?.map((image: any, key: number) => {
                          let img = (typeof image == "string") ? image.slice(19, 58) : "";
                          return (
                            <div className="flex justify-between w-full mx-auto my-3" key={`images-${key}`}>
                              <div className="flex w-4/12">
                                <div className="file-image">
                                  <img src={`${this.IMAGE_PATH}temp/${image}`} alt="" />
                                </div>
                                <h5 className="my-auto">{`${img}`}</h5>
                              </div>
                              <TextField className="w-8/12 my-auto"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: 34,
                                  },
                                }}
                                placeholder="画像フリーコメント  "
                                value={this.state.modalComments[key] || ""}
                                onChange={(event: any) => {
                                  let modalComments = this.state.modalComments
                                  modalComments[key] = event.target.value
                                  this.setState({ modalComments: modalComments })
                                }} />
                              <img className="cursor-pointer" src="assets/icons/Close.svg"
                                onClick={(e) => {
                                  e.preventDefault()
                                  let modalImages = this.state.modalImages
                                  let modalComments = this.state.modalComments
                                  modalImages.splice(key, 1)
                                  modalComments.splice(key, 1)
                                  this.setState({ modalImages: modalImages })
                                  this.setState({ modalComments: modalComments })
                                }} />
                            </div>
                          )
                        })
                      }
                    </div>
                    {this.state.modalRow?.操作 == 2 &&
                      <div className="flex justify-evenly text-[12px] border border-[#24BFF2] bg-[#BCD8F1] rounded-[22px] w-[130px] h-[25px] my-2 justify-center text-center font-Meiryo cursor-pointer"
                        onClick={() => {
                          this.setState({ isModalRow: true })
                          this.setState({ openAddModal: true })
                        }}>
                        <span className="flex items-center w-[16px] h-[16px] border rounded-[5px] justify-center text-center my-auto">+</span>
                        <span className="my-auto">アップロード</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              {/* Rank & Trader1 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-2/12 my-auto pl-10">卸先名</label>
                  <TextField className="w-10/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['卸先名']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['卸先名'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* Buy & Sell */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">最低価格</label>
                  <TextField className="w-8/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['最低価格']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['最低価格'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-4/12 my-auto pl-10">最高価格</label>
                  <TextField className="w-8/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['最高価格']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['最高価格'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              <div className="flex justify-center mx-auto w-full">
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] text-[14px] text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ openDetailModal: false })
                  }}
                >キャンセル</button>
                {this.state.modalRow?.操作 == 2 ?
                  <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] text-[14px] text-white bg-primary mx-1"
                    onClick={(e) => {
                      e.preventDefault()
                      this.onSaveDetailModal()
                    }}>保  存</button> :
                  <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] text-[14px] text-white bg-primary mx-1 disabled:bg-gray-200 disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault()
                      this.onSaveDetailModal()
                    }} disabled>保  存</button>
                }
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
                <button className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ openDeleteModal: false })
                  }}
                >いいえ</button>
                <button className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault()
                    this.onDeleteRow()
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

  public onActiveCellChange(s: IgrDataGrid, e: IgrGridActiveCellChangedEventArgs) {

    if (s.activeCell !== null) {
      let rowIndex = s.activeCell.rowIndex;
      let dataItem = s.actualDataSource.getItemAtIndex(rowIndex)
      let columnKey = e.newActiveCell.columnUniqueKey;

      s.editMode = 1

      if (s.editMode == 1) {
        if (columnKey == '日付' && !dataItem['日付']) {
          dataItem['日付'] = new Date()
        }
      }
    }

  }

  public onCellDataBound = (s: any, e: IgrDataBindingEventArgs) => {

    e.cellInfo.background = "#FFFFFF";
  }

  public changedHistoryData = [] as any
  public onCellValueChanging = (s: IgrDataGrid, e: IgrGridCellValueChangingEventArgs) => {

    const rowIndex = s.activeCell.rowIndex;
    const dataItem = s.actualDataSource.getItemAtIndex(rowIndex)
    const columnKey = e.column.field

    let obj = {} as any

    obj['field'] = columnKey
    obj['product_number'] = dataItem['商品No']
    obj['old_value'] = e.oldValue
    obj['new_value'] = e.newValue
    obj['username'] = this.userName

    this.changedHistoryData.push(obj)

    e.cellInfo.rowItem['操作'] = 1;
  }

  public onActionCellUpdating = (s: IgrTemplateColumn, e: IgrTemplateCellUpdatingEventArgs) => {

    const content = e.content as HTMLDivElement;
    content.style.display = 'flex'
    content.style.padding = '5px'

    let span1: HTMLSpanElement | null = null;
    let span2: HTMLSpanElement | null = null;
    let img: HTMLImageElement | null = null;

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

    } else if (e.cellInfo.rowItem['操作'] == 2 || !e.cellInfo.rowItem['入金日']) {
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
    } else {
      //nonEditable 0
      content.innerHTML = ""
      if (content.childElementCount === 0) {
        img = document.createElement('img')
        img.src = "/assets/icons/NotEditable.svg"
        content.appendChild(img)

        span1 = document.createElement('span')
        span1.textContent = '詳細'
        // span1.style.color = '#0066FF'
        span1.style.color = '#808080'
        span1.style.margin = 'auto'
        span1.style.cursor = 'pointer'

        span1.onclick = event => {
          event.preventDefault()
          this.onOpenDetailModal(e.cellInfo.rowItem)
        }

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
      } else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
        img = content.children[0] as HTMLImageElement;
      }
    }
  }

  public onImageCellUpdating = (s: IgrTemplateColumn, e: IgrTemplateCellUpdatingEventArgs) => {

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
        this.setState({ isAddRow: false })
        this.setState({ openRemoveModal: true })
        this.setState({ images: e.cellInfo.rowItem['画像'] })
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
    const sales = this.grid.actualDataSource.getItemProperty(info.rowItem, "Product");
    const images = item['画像'];

    for (let i = 0; i < images.length; i++) {

      let imgTag: HTMLImageElement | null = null;
      imgTag = document.createElement('img')

      if (imgContent.childElementCount === i) {

        imgTag.src = this.IMAGE_PATH + images[i]
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
          this.setState({ isAddRow: false })
          this.onViewImage(i)
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
        this.setState({ isAddRow: false })
        this.setState({ openAddModal: true });
      }

      content.appendChild(addBtn)

    } else {
      addBtn = content.children[2] as HTMLInputElement;
    }

  }

  //cancel changed value
  public onCancelRow = (e: IgrTemplateCellUpdatingEventArgs) => {

    //set origin value
    let otherHistoryData = [] as any
    this.changedHistoryData.forEach((element: any) => {
      if (e.cellInfo.rowItem['商品No'] != element['product_number']) {
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

      //update row
      const res = await api.client.updateProduct(e.cellInfo.rowItem['id'], e.cellInfo.rowItem)
      //add update history----------------------------------------------------
      let ownHistoryData = [] as any
      let otherHistoryData = [] as any
      this.changedHistoryData.forEach((element: any) => {
        if (e.cellInfo.rowItem['商品No'] == element['product_number']) {
          ownHistoryData.push(element)
        } else {
          otherHistoryData.push(element)
        }
      })

      const res_history = await api.store.updateSaleHistory(e.cellInfo.rowItem['id'], ownHistoryData)

      this.changedHistoryData = otherHistoryData
      // add update history end ------------------------------------------
    } else {
      const res = await api.client.createProduct(e.cellInfo.rowItem)
    }
  }

  //delete selected row
  public onDeleteRow = async () => {
    // Make a copy of data array
    let data = [...this.state.data]

    this.activeRowIndex = this.grid.activeCell.rowIndex;

    const row = data[this.activeRowIndex]
    const res = await api.client.deleteProduct(row['id'])

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ total: this.state.total - 1 })
    this.setState({ openDeleteModal: false })
  }

  //add new row

  public onAddRow = () => {
    const new_data = { 'ステイタス': '', '日付': new Date(), '商品種別A': '', '商品種別B': '', '商品名': '', 'ブランド': '', '説明': '', 'URL': '', '卸先名': '', '最低価格': 0, '最高価格': 0, '画像': [] as any, '操作': 1 }
    this.setState({ addRowData: new_data })
    this.setState({ addRowHidden: true })
    this.grid.scrollTo(0, 100000000)
  }

  public handleScroll = (event: any) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    this.grid.scrollTo(scrollLeft, 100000000)
  }

  public onChangedAddRow = (field: string, value: any) => {
    let data = this.state.addRowData
    data[field] = value
    this.setState({ addRowData: data })
  }

  public onAddRowSave = async () => {
    try {
      const res = await api.client.createProduct(this.state.addRowData)
      if (res.status == 201) {

        let data = this.state.data
        let temp = this.state.addRowData
        temp['id'] = res.data.id
        data.push(temp)
        this.grid.notifyInsertItem(data.length - 1, this.state.addRowData)
        this.setState({ total: this.state.total + 1, lastIndex: this.state.lastIndex + 1 })
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

  //upload csv
  public onUploadCSV = (event: any) => {

    const file = event.target.files[0];
    if (!file) return;
    if (file.type != 'text/csv') {
      toast.warning('申し訳ありませんが、csvファイル形式を使用してください。')
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {

      const csv = e.target.result;
      const final_results = [] as any;

      if (typeof csv === 'string') {

        this.setState({ loading: true })

        Papa.parse(csv, {
          complete: function (results) {

            const headers: string[] = [
              'ステイタス', '日付', '商品種別A', '商品種別B', '商品名', 'ブランド', '説明', 'URL',
              '卸先名', '最低価格', '最高価格', '画像',
              '画像フリーコメント', 'メールアドレス'
            ];

            const csv_headers: any = results.data[0]

            for (let i = 1; i < results.data.length; i++) {

              const innerArray: any = results.data[i];
              const row: any = {};

              for (let j = 0; j < innerArray.length; j++) {

                let element = innerArray[j];
                const header: string = csv_headers[j]

                if (headers.indexOf(header) !== -1) {
                  if (header == '商品No') { row[header] = i }
                  else if (header == '買取額' || header == '最低価格') {
                    row[header] = parseFloat(element.replace(/,/g, '').replace(/¥/g, '').replace('(', '-').replace(')', ''));
                  } else if (element.indexOf('1900') != -1) { row[header] = null }
                  else row[header] = element.replace(/,/g, '').replace(/¥/g, '');
                }

              }

              final_results.push(row);

            }
          },
        });

        await api.store.csvUploadSales(final_results).then((response: any) => {
          if (response.data.success === true) {
            window.location.reload()
          }
        });

      } else {
        toast.error('CSVアップロードに失敗しました。');
      }
    };

    reader.readAsText(file);

  }

  //key event
  public onKeyDown = (event: any) => {

    let data = this.state.data;

    if ((event.ctrlKey) && event.code === 'KeyC') {

      this.activeRowIndex = this.grid.activeCell.rowIndex;
      this.setState({ copiedRowIndex: this.activeRowIndex, copiedRow: data[this.activeRowIndex] })

    }
  }
  public onKeyUp = (event: any) => {
    if (this.grid.activeCell == null) return;

    let data = [...this.state.data]; // Make a copy of data array

    if ((event.ctrlKey) && event.code === 'KeyV' && !this.state.activeRowIndex && !this.state.addRowHidden) {

      this.activeRowIndex = this.grid.activeCell.rowIndex;
      const rowId = data[this.activeRowIndex]['id'];
      const rowNo = data[this.activeRowIndex]['商品No'];
      const rowDate = data[this.activeRowIndex]['日付'];

      // Remove the original row from the array
      data.splice(this.activeRowIndex, 1);

      // Create a new object with the copied row data
      const newRowData = { ...this.state.copiedRow };
      newRowData['id'] = rowId
      newRowData['商品No'] = rowNo
      newRowData['日付'] = rowDate
      newRowData['操作'] = 1

      // Insert the new row at the active row index
      data.splice(this.activeRowIndex, 0, newRowData);


      this.setState({ data: data });
      this.grid.notifyInsertItem(this.activeRowIndex, 1);

      //set history
      let obj = {} as any

      obj['field'] = 'コピー済み'
      obj['product_number'] = rowNo
      obj['old_value'] = '商品名' + this.state.copiedRow['商品No']
      obj['new_value'] = '商品名' + rowNo
      obj['username'] = this.userName

      this.changedHistoryData.push(obj)

    }
  }
  public handlKeyDown = (event: KeyboardEvent) => {
    {
      if ((event.ctrlKey) && event.code === 'KeyV' && this.state.addRowHidden) {
        const copiedRowData = { ...this.state.copiedRow };
        const new_data = this.state.addRowData
        this.setState({ addRowData: copiedRowData })
      }
    }
  }
  //open detail modal
  public onOpenDetailModal = async (row: any) => {
    const rowIndex = this.grid.activeCell.rowIndex
    this.setState({
      modalRow: this.grid.dataSource[rowIndex],
      openDetailModal: true,
      modalImages: [],
      modalComments: []
    })

    //get history
    const id = this.grid.dataSource[rowIndex]['id']

    this.rowIndex = rowIndex
    this.old_modal_data = this.grid.dataSource[rowIndex]
    const res = await api.store.getSaleHistory(id)

    this.setState({ historyData: res.data.data })
  }

  public onSaveDetailModal = async () => {

    let data = this.state.modalRow

    data['画像'] = data['画像']?.concat(this.state.modalImages)
    data['画像フリーコメント'] = data['画像フリーコメント']?.concat(this.state.comments)
    console.log(data)
    //save changed value
    if (this.state.modalRow['id']) {
      const res = await api.client.updateModalProduct(data);
    } else {
      const res = await api.client.createProduct(this.state.modalRow)
    }

    this.grid.notifySetItem(this.rowIndex, this.old_modal_data, data)
    this.setState({ openDetailModal: false })
  }

  //upload Image
  public onUploadImages = async () => {
    this.setState({ loading: true })
    let rowId: any
    let rowIndex: number
    let uploadImage = {} as any

    if (this.state.openDetailModal) uploadImage = this.state.tempImages
    else uploadImage = this.state.images

    if (this.state.isAddRow || this.state.isModalRow) rowId = 'isAddRow'
    else {
      rowIndex = this.grid.activeCell.rowIndex
      rowId = this.grid.dataSource[rowIndex]?.id
    }

    await api.client.imageUpload({ id: rowId, files: uploadImage }).then((response: any) => {
      // Handle the response
      if (response.data.success === true) {
        if (this.state.isAddRow) {

          let rowData = this.state.addRowData
          rowData['画像'] = rowData['画像']?.concat(response.data.data)

          this.setState({ images: rowData['画像'] })
          this.setState({ addRowData: rowData })

        } else if (this.state.isModalRow) {

          let images = this.state.modalImages;
          let comments = [] as any
          images = images?.concat(response.data.data)
          response.data.data.forEach((e: any) => {
            comments.push("")
          });
          this.setState({ modalImages: images })
          this.setState({ modalComments: comments })

        } else {

          let data = this.state.data
          data[rowIndex]['画像'] = response.data.data
          this.setState({ data: data })
          this.setState({ images: data[rowIndex]['画像'] })
          this.grid.notifyInsertItem(rowIndex, 1);
        }

        this.setState({ isAddRow: false })
        this.setState({ isModalRow: false })
        this.setState({ loading: false })

        toast.success('画像アップロードに成功しました！');
        this.setState({ openAddModal: false });

      }
    });

    this.setState({ tempImages: null })

  }

  public onChangeImages = (value: any) => {
    if (this.state.openDetailModal) this.setState({ tempImages: value })
    else this.setState({ images: value })
  }

  public onViewImage = (imageId: any) => {

    let imageURL: any
    const rowIndex = this.grid.activeCell.rowIndex
    const imageComment = this.grid.dataSource[rowIndex]['画像フリーコメント'][imageId] || "コメントなし"

    if (this.state.isAddRow) {
      let images = this.state.addRowData['画像']
      this.isImageLink(images).then(
        (result: boolean) => {
          if (result) {
            images = this.state.addRowData['画像']
          }
        }
      );
      imageURL = this.IMAGE_PATH + 'temp/' + images[imageId]
    } else {
      const images = this.grid.dataSource[rowIndex]['画像']
      imageURL = this.IMAGE_PATH + images[imageId]
    }

    this.setState({ imageURLID: imageId });
    this.setState({ imageURL: imageURL });
    this.setState({ imageComment: imageComment });
    this.setState({ openViewModal: true });
  }

  public async isImageLink(link: string): Promise<boolean> {
    try {
      const response = await fetch(link);
      const contentTypeHeader = response.headers.get('Content-Type');

      if (contentTypeHeader && contentTypeHeader.startsWith('image/')) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  public nextImageView = () => {

    let images: any
    let imageId: any

    if (this.state.isAddRow) {
      images = this.state.addRowData['画像']
      imageId = this.state.imageURLID + 1
    } else {
      const rowIndex = this.grid.activeCell.rowIndex
      images = this.grid.dataSource[rowIndex]['画像']
      imageId = this.state.imageURLID + 1
    }

    if (imageId == images.length) this.onViewImage(0)
    else this.onViewImage(imageId)

  }

  public prevImageView = () => {

    let images: any
    let imageId: any

    if (this.state.isAddRow) {
      images = this.state.addRowData['画像']
      imageId = this.state.imageURLID - 1
    } else {
      const rowIndex = this.grid.activeCell.rowIndex
      images = this.grid.dataSource[rowIndex]['画像']
      imageId = this.state.imageURLID - 1
    }

    if (imageId < 0) this.onViewImage(images.length - 1)
    else this.onViewImage(imageId)
  }

  public onRemoveImages = async () => {
    let rowId: any
    let rowIndex: number

    if (this.state.isAddRow) rowId = 'isAddRow'
    else {
      rowIndex = this.grid.activeCell.rowIndex
      rowId = this.grid.dataSource[rowIndex]?.id
    }

    await api.client.imageRemove({ id: rowId, files: this.state.images }).then((response: any) => {
      // Handle the response
      if (response.data.success === true) {
        this.setState({ openRemoveModal: false });
        if (this.state.isAddRow) {
          let rowData = this.state.addRowData
          rowData['画像'] = response.data.data
          this.setState({ addRowData: rowData })
        }
        else {
          let data = this.state.data
          data[rowIndex]['画像'] = response.data.data
          this.setState({ data: data })
          this.grid.notifyInsertItem(rowIndex, 1);
        }
      }

    });

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
          key != "v"
        ) {
          if (index == 0) {
            title.push(key)
          }
          arr.push(value)
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

