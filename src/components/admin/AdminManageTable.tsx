import React from "react";
import api from "src/api";
import Modal from '@material-ui/core/Modal';
import Papa, { ParseResult } from 'papaparse';
import { ToastContainer, toast } from 'react-toastify';
import { MenuItem, Box, Button, TextField, Select, SelectChangeEvent, Checkbox } from "@mui/material";
import * as XLSX from 'xlsx';

import { adminRole } from "src/constants/AdminOptions";

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
  IgrNumericColumn,
  IgrTemplateColumn,
  IgrImageColumn,
  IgrTemplateCellInfo,
  IgrDataGridColumn,
} from 'igniteui-react-grids';

// importing localization data:
import { Localization } from 'igniteui-react-core';
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';


// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();

export default class AdminManageTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;

  //set value
  public userName = localStorage.getItem('userName');
  public userRole = localStorage.getItem('userRole');
  public permission = localStorage.getItem('permission').split(",");

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40

  public old_modal_data = {} as any
  public new_modal_data = {} as any
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

    this.onGetData()

    this.state = {
      data: [],
      loading: true,
      copiedRow: null,
      historyData: null,
      copiedRowIndex: null,

      addRowData: {},
      isAddRow: false,
      isAddRowFocused: false,
      addRowHidden: false,

      old_modalRow: null,
      modalRow: null,
      openDetailModal: false,
      openDeleteModal: false,

      total: 0,
      storeName: [],

      choosedStoreName: [''],
      checkedStore: [false, false, false, false, false, false, false],
      checkedSale: [false, false, false, false, false, false, false],
      checkedAdmin: [false, false, false, false, false, false, false],
      checkedEmployee: [false, false, false, false, false, false, false],
      checkedMaster: [false, false, false, false, false, false, false],
      checkedBoard: [false, false, false, false, false, false, false],
      checkedAccess: [false, false, false, false, false, false, false],
    }

    Localization.register("DataGrid-en", new DataGridLocalizationJa());
    Localization.register("DataVisualization-en", new DataGridSummariesLocalizationJa());
    Localization.register("Calendar-en", new DataGridDateTimeColumnLocalizationJa());
    Localization.register("MultiColumnComboBox-en", new DataGridMultiColumnComboBoxLocalizationJa());

  }

  // loading more getting data end

  public onGetData = async () => {

    // loading params
    const params = {
      dataName: 'admins',
    };
    // loading params end

    const res = await api.client.getAdmin(params)
    // check getting data status
    if (res.status == 400) return;
    const temp = res.data.data
    const total = res.data.total

    let changedTypeData: any[] = []

    temp.forEach((item: any) => {
      item['操作'] = 0
      changedTypeData.push(item)
    })
    const temp_storeName = res.data.storeName

    let storeName = [] as any
    temp_storeName.forEach((element: { id: any; 店舗名: any; }) => {
      storeName.push({ value: element.店舗名, key: element.id })
    });
    // getting result show
    this.setState({ data: changedTypeData })
    this.setState({ total: total })
    this.setState({ storeName: storeName })
    this.setState({ loading: false });

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

                if (this.permission[19] == 'true' || this.userRole == 'super_admin') {
                  event.preventDefault()
                  this.onExportExcel("管理者一覧")
                } else {
                  alert("権限が付与されていません。管理者に連絡してください。");
                }

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
              editMode={(this.permission[17] == 'true' || this.userRole == 'super_admin') ? 1 : 0}
              summaryScope="none"
              filterUIType="FilterRow"
              columnMovingMode={'none'}
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              notifyOnAllSelectionChanges={true}
              cellValueChanging={this.onCellValueChanging}
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
              <IgrTextColumn field="姓名" />
              <IgrTextColumn field="メールアドレス" />
              <IgrTemplateColumn field="操作" width={'150'} pinned='right' cellUpdating={this.onActionCellUpdating} />

            </IgrDataGrid>
            {/* Bottom Button */}
            <div className={`flex ${!this.state.addRowHidden && 'hidden'} absolute overflow-x-auto overflow-y-hidden w-full bottom-[50px]`} onScroll={this.handleScroll} onClick={this.handlClick}>
              <input className="addRow-input !w-1/2 min-w-[150px]" placeholder="姓名" value={this.state.addRowData['姓名']} onChange={(event) => this.onChangedAddRow('姓名', event.target.value)} />
              <input className="addRow-input !w-1/2 min-w-[150px]" placeholder="メールアドレス" value={this.state.addRowData['メールアドレス']} onChange={(event) => this.onChangedAddRow('メールアドレス', event.target.value)} />
              <div className="addRow-input !w-[150px] h-[35px] flex" placeholder="操作" />
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
          className="min-w-[876px]"
          open={this.state.openDetailModal}
          style={{
            position: 'absolute',
            width: '40vw',
            margin: 'auto',
            height: '80vh',
          }}
          onClose={() => {
            this.setState({ openDetailModal: false })
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full border-none">
            <div className="flex w-full h-[70px] px-[40px] bg-[#BCD8F1] rounded-t-[20px]">
              <h1 className="font-Meiryo text-[20px] my-auto">管理者詳細</h1>
            </div>
            <div className="bg-white p-10 overflow-y-auto rounded-b-[20px]">

              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">姓名</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['姓名']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['姓名'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>

                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">姓名（フリガナ）</label>
                  <TextField className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['姓名（フリガナ）']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['姓名（フリガナ）'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
              </div>

              {/* メールアドレス , 店舗名 */}
              <div className="flex items-start w-full">
                <div className="flex w-full pr-5">
                  <label className="w-1/2 my-auto pl-10">メールアドレス</label>
                  <TextField className="w-1/2 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.['メールアドレス']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['メールアドレス'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-1/2 pl-10 pt-1">店舗名</label>
                  <div className="w-1/2 justify-between">
                    {this.state.choosedStoreName.map((item: any, key: number) => {
                      return (
                        <div key={key} className="flex mb-1">
                          <Select className="w-full h-[34px]" id="店舗名"
                            value={this.state.modalRow?.['店舗名'][key]}
                            onChange={(event: SelectChangeEvent) => {
                              let data = this.state.modalRow
                              let temp_choosedStoreName = this.state.choosedStoreName

                              temp_choosedStoreName[key] = event.target.value
                              data['店舗名'] = temp_choosedStoreName

                              this.setState({ modalRow: data })
                              this.setState({ choosedStoreName: temp_choosedStoreName })

                            }}
                          >
                            {
                              this.state.storeName.map((item: {
                                key: any; value: string
                              }, key: any) => {
                                return (
                                  <MenuItem value={`${item.value}`} key={`${key}`}>
                                    {item.value}
                                  </MenuItem>
                                )
                              })
                            }
                          </Select>
                          <div className={`cursor-pointer mt-[5px] ml-[5px] ${key == 0 && 'hidden'}`}>
                            <img className="w-[25px] h-[25px]" src="assets/icons/Close.svg"
                              onClick={(e) => {
                                e.preventDefault()
                                let temp_choosedStoreName = this.state.choosedStoreName
                                temp_choosedStoreName.splice(key, 1)
                                this.setState({ choosedStoreName: temp_choosedStoreName })
                              }} />
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex text-[25px] my-2 justify-center cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()

                        // // Find the index of the element to delete
                        // let temp_storeName = this.state.storeName
                        // this.state.modalRow?.['店舗名'].map((name: string) => {
                        //   temp_storeName.map((item: {
                        //     key: any; value: string
                        //   }, key: any) => {
                        //     if (item.value == name)
                        //       temp_storeName.splice(key, 1)
                        //   })
                        // })
                        // this.setState({ storeName: temp_storeName })

                        if (this.state.storeName.length == this.state.choosedStoreName.length) return;
                        let temp_choosedStoreName = this.state.choosedStoreName
                        temp_choosedStoreName.push('')
                        this.setState({ choosedStoreName: temp_choosedStoreName })
                      }}>
                      <span className="flex items-center w-[30px] h-[30px] border-black-900 rounded-[5px] justify-center text-center my-auto">+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 役職 */}
              <div className="flex w-1/2">
                <div className="flex w-full pr-5">
                  <label className="w-1/2 my-auto pl-10">役職</label>
                  <Select className="w-1/2 my-auto h-[34px]" id="役職"
                    value={this.state.modalRow?.['役職']}
                    onChange={(event: SelectChangeEvent) => {
                      let data = this.state.modalRow
                      data['役職'] = event.target.value
                      this.setState({ modalRow: data })
                    }}
                  >
                    {
                      adminRole.map((item: {
                        key: any; value: string
                      }, key: any) => {
                        return (
                          <MenuItem value={`${item.value}`} key={`${key}`}>
                            {item.value}
                          </MenuItem>
                        )
                      })
                    }
                  </Select>
                </div>
              </div>

              <div className="w-full my-5 pr-10 pl-10">
                <div>権限設定</div>
                <hr className="border-3 border-black-900 my-3" />
                <div className="w-full grid grid-cols-7 gap-4 place-items-center">
                  <div> </div>
                  <div>参照</div>
                  <div>登録</div>
                  <div>編集</div>
                  <div>削除 </div>
                  <div>CSVファイル</div>
                  <div>すべて選択</div>

                  <div>店舗管理 </div>
                  <div><Checkbox checked={this.state.checkedStore[1]} onChange={this.handleChange} value="checkedStore1" /></div>
                  <div><Checkbox checked={this.state.checkedStore[2]} onChange={this.handleChange} value="checkedStore2" /></div>
                  <div><Checkbox checked={this.state.checkedStore[3]} onChange={this.handleChange} value="checkedStore3" /></div>
                  <div><Checkbox checked={this.state.checkedStore[4]} onChange={this.handleChange} value="checkedStore4" /></div>
                  <div><Checkbox checked={this.state.checkedStore[5]} onChange={this.handleChange} value="checkedStore5" /></div>
                  <div><Checkbox checked={this.state.checkedStore[6]} onChange={this.handleChange} value="checkedStore6" /></div>

                  <div>卸先管理 </div>
                  <div><Checkbox checked={this.state.checkedSale[1]} onChange={this.handleChange} value="checkedSale1" /></div>
                  <div><Checkbox checked={this.state.checkedSale[2]} onChange={this.handleChange} value="checkedSale2" /></div>
                  <div><Checkbox checked={this.state.checkedSale[3]} onChange={this.handleChange} value="checkedSale3" /></div>
                  <div><Checkbox checked={this.state.checkedSale[4]} onChange={this.handleChange} value="checkedSale4" /></div>
                  <div><Checkbox checked={this.state.checkedSale[5]} onChange={this.handleChange} value="checkedSale5" /></div>
                  <div><Checkbox checked={this.state.checkedSale[6]} onChange={this.handleChange} value="checkedSale6" /></div>

                  <div>管理者管理 </div>
                  <div><Checkbox checked={this.state.checkedAdmin[1]} onChange={this.handleChange} value="checkedAdmin1" /></div>
                  <div><Checkbox checked={this.state.checkedAdmin[2]} onChange={this.handleChange} value="checkedAdmin2" /></div>
                  <div><Checkbox checked={this.state.checkedAdmin[3]} onChange={this.handleChange} value="checkedAdmin3" /></div>
                  <div><Checkbox checked={this.state.checkedAdmin[4]} onChange={this.handleChange} value="checkedAdmin4" /></div>
                  <div><Checkbox checked={this.state.checkedAdmin[5]} onChange={this.handleChange} value="checkedAdmin5" /></div>
                  <div><Checkbox checked={this.state.checkedAdmin[6]} onChange={this.handleChange} value="checkedAdmin6" /></div>

                  <div>社員管理 </div>
                  <div><Checkbox checked={this.state.checkedEmployee[1]} onChange={this.handleChange} value="checkedEmployee1" /></div>
                  <div><Checkbox checked={this.state.checkedEmployee[2]} onChange={this.handleChange} value="checkedEmployee2" /></div>
                  <div><Checkbox checked={this.state.checkedEmployee[3]} onChange={this.handleChange} value="checkedEmployee3" /></div>
                  <div><Checkbox checked={this.state.checkedEmployee[4]} onChange={this.handleChange} value="checkedEmployee4" /></div>
                  <div><Checkbox checked={this.state.checkedEmployee[5]} onChange={this.handleChange} value="checkedEmployee5" /></div>
                  <div><Checkbox checked={this.state.checkedEmployee[6]} onChange={this.handleChange} value="checkedEmployee6" /></div>

                  <div>マスタ管理 </div>
                  <div><Checkbox checked={this.state.checkedMaster[1]} onChange={this.handleChange} value="checkedMaster1" /></div>
                  <div><Checkbox checked={this.state.checkedMaster[2]} onChange={this.handleChange} value="checkedMaster2" /></div>
                  <div><Checkbox checked={this.state.checkedMaster[3]} onChange={this.handleChange} value="checkedMaster3" /></div>
                  <div><Checkbox checked={this.state.checkedMaster[4]} onChange={this.handleChange} value="checkedMaster4" /></div>
                  <div><Checkbox checked={this.state.checkedMaster[5]} onChange={this.handleChange} value="checkedMaster5" /></div>
                  <div><Checkbox checked={this.state.checkedMaster[6]} onChange={this.handleChange} value="checkedMaster6" /></div>

                  <div>掲示板管理 </div>
                  <div><Checkbox checked={this.state.checkedBoard[1]} onChange={this.handleChange} value="checkedBoard1" /></div>
                  <div><Checkbox checked={this.state.checkedBoard[2]} onChange={this.handleChange} value="checkedBoard2" /></div>
                  <div><Checkbox checked={this.state.checkedBoard[3]} onChange={this.handleChange} value="checkedBoard3" /></div>
                  <div><Checkbox checked={this.state.checkedBoard[4]} onChange={this.handleChange} value="checkedBoard4" /></div>
                  <div><Checkbox checked={this.state.checkedBoard[5]} onChange={this.handleChange} value="checkedBoard5" /></div>
                  <div><Checkbox checked={this.state.checkedBoard[6]} onChange={this.handleChange} value="checkedBoard6" /></div>

                  <div>アクセス管理 </div>
                  <div><Checkbox checked={this.state.checkedAccess[1]} onChange={this.handleChange} value="checkedAccess1" /></div>
                  <div><Checkbox checked={this.state.checkedAccess[2]} onChange={this.handleChange} value="checkedAccess2" /></div>
                  <div><Checkbox checked={this.state.checkedAccess[3]} onChange={this.handleChange} value="checkedAccess3" /></div>
                  <div><Checkbox checked={this.state.checkedAccess[4]} onChange={this.handleChange} value="checkedAccess4" /></div>
                  <div><Checkbox checked={this.state.checkedAccess[5]} onChange={this.handleChange} value="checkedAccess5" /></div>
                  <div><Checkbox checked={this.state.checkedAccess[6]} onChange={this.handleChange} value="checkedAccess6" /></div>
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
              <div className="flex justify-center mx-auto w-full my-5 pr-5">
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ openDetailModal: false });

                    const index = parseInt(localStorage.getItem('old_modal_rowIndex'), 10);
                    const old_modal_data = JSON.parse(localStorage.getItem('old_modal_data'));

                    let data = this.state.data
                    data[index] = old_modal_data;
                    
                    this.grid.notifyInsertItem(index, old_modal_data);                    

                  }} >キャンセル</button>
                <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1" onClick={(e) => { e.preventDefault(); this.onSaveDetailModal() }}>保  存</button>
              </div>
            </div>
          </div>
        </Modal >
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
              <h1 className="font-Meiryo text-[14px] my-auto">管理者削除</h1>
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
      // } else if (e.cellInfo.rowItem['操作'] == 2) {
    } else if (e.cellInfo.rowItem['操作'] == 0) {
      //Editable 2
      content.innerHTML = ""
      if (content.childElementCount === 0) {
        span1 = document.createElement('span')
        span1.textContent = '詳細'
        span1.style.color = '#0066FF'
        span1.onclick = event => {
          if (this.permission[17] == 'true' || this.userRole == 'super_admin') {
            event.preventDefault()
            this.onOpenDetailModal(e.cellInfo.rowItem)
          } else {
            alert("権限が付与されていません。管理者に連絡してください。");
          }
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
          if (this.permission[18] == 'true' || this.userRole == 'super_admin') {
            e.preventDefault()
            this.setState({ openDeleteModal: true })
          } else {
            alert("権限が付与されていません。管理者に連絡してください。");
          }
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
    obj['admin_name'] = dataItem['姓名']
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
    e.cellInfo.rowItem['操作'] = 0
    //save changed value
    if (e.cellInfo.rowItem['id']) {
      const res = await api.client.updateAdmin(e.cellInfo.rowItem['id'], e.cellInfo.rowItem)

      //add update history
      let ownHistoryData = [] as any
      let otherHistoryData = [] as any
      this.changedHistoryData.forEach((element: any) => {
        if (e.cellInfo.rowItem['姓名'] == element['admin_name']) {
          ownHistoryData.push(element)
        } else {
          otherHistoryData.push(element)
        }
      })

      const res_history = await api.client.updateAdminHistory(e.cellInfo.rowItem['id'], ownHistoryData)
      this.changedHistoryData = otherHistoryData

    } else {
      const res = await api.client.createAdmin(e.cellInfo.rowItem)
    }

    toast.success('保存されました。')
  }

  //delete selected row
  public onDeleteRow = async () => {
    // Make a copy of data array
    let data = [...this.state.data]

    this.activeRowIndex = this.grid.activeCell.rowIndex;

    const row = data[this.activeRowIndex];
    const res = await api.client.deleteAdmin(row['id']);

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ openDeleteModal: false })
  }

  //add new row
  public onAddRow = () => {
    if (this.permission[16] == 'true' || this.userRole == 'super_admin') {
      const new_data = { '店舗名': '', '姓名': '', '電話番号': '', 'メールアドレス': '', '郵便番号': '', '都道府県': '', '住所': '', '操作': 0, }
      this.setState({ addRowData: new_data })
      this.setState({ addRowHidden: true })
      this.grid.scrollTo(0, 10000000)
    } else {
      alert("権限が付与されていません。管理者に連絡してください。");
    }
  }

  public handleScroll = (event: any) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    this.grid.scrollTo(scrollLeft, 10000000)
  }

  public onChangedAddRow = (field: string, value: any) => {
    let data = this.state.addRowData

    data[field] = value

    this.setState({ addRowData: data })
  }

  public onAddRowSave = async () => {
    try {
      console.log("This is data to send to admin api")
      console.log(this.state.addRowData);
      const res = await api.client.createAdmin(this.state.addRowData)
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

    let data = this.state.data;

    if ((event.ctrlKey) && event.code === 'KeyC') {

      this.activeRowIndex = this.grid.activeCell.rowIndex;
      this.setState({ copiedRowIndex: this.activeRowIndex, copiedRow: data[this.activeRowIndex] })

    }
  }
  public onKeyUp = (event: any) => {
    if (this.grid.activeCell == null || this.state.copiedRow == null) return;

    let data = [...this.state.data]; // Make a copy of data array

    if ((event.ctrlKey) && event.code === 'KeyV') {

      if (!this.state.isAddRowFocused) {
        this.activeRowIndex = this.grid.activeCell.rowIndex;
        const rowId = data[this.activeRowIndex]['id'];

        // Remove the original row from the array
        data.splice(this.activeRowIndex, 1);

        // Create a new object with the copied row data
        const newRowData = { ...this.state.copiedRow };
        newRowData['id'] = rowId
        newRowData['操作'] = 1

        // Insert the new row at the active row index
        data.splice(this.activeRowIndex, 0, newRowData);

        this.setState({ data: data });
        this.grid.notifyInsertItem(this.activeRowIndex, 1);

        //set history
        let obj = {} as any

        obj['field'] = 'コピー済み'
        obj['username'] = this.userName

        this.changedHistoryData.push(obj)
      } else {

        const newRowData = { ...this.state.copiedRow };

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

    this.setState({ modalRow: this.grid.dataSource[rowIndex] })

    if (this.grid.dataSource[rowIndex]['店舗名'] == undefined || this.grid.dataSource[rowIndex]['店舗名'].length == 0) {
      this.setState({ choosedStoreName: [''] })
    } else {
      this.setState({ choosedStoreName: this.grid.dataSource[rowIndex]['店舗名'] })
    }
    if (this.grid.dataSource[rowIndex]['権限設定'] == undefined || this.grid.dataSource[rowIndex]['権限設定'].length == 0) {
      this.setState({ checkedStore: [false, false, false, false, false, false, false] })
      this.setState({ checkedSale: [false, false, false, false, false, false, false] })
      this.setState({ checkedAdmin: [false, false, false, false, false, false, false] })
      this.setState({ checkedEmployee: [false, false, false, false, false, false, false] })
      this.setState({ checkedMaster: [false, false, false, false, false, false, false] })
      this.setState({ checkedBoard: [false, false, false, false, false, false, false] })
      this.setState({ checkedAccess: [false, false, false, false, false, false, false] })
    } else {
      this.setState({ checkedStore: this.grid.dataSource[rowIndex]['権限設定'][0] })
      this.setState({ checkedSale: this.grid.dataSource[rowIndex]['権限設定'][1] })
      this.setState({ checkedAdmin: this.grid.dataSource[rowIndex]['権限設定'][2] })
      this.setState({ checkedEmployee: this.grid.dataSource[rowIndex]['権限設定'][3] })
      this.setState({ checkedMaster: this.grid.dataSource[rowIndex]['権限設定'][4] })
      this.setState({ checkedBoard: this.grid.dataSource[rowIndex]['権限設定'][5] })
      this.setState({ checkedAccess: this.grid.dataSource[rowIndex]['権限設定'][6] })
    }


    this.setState({ openDetailModal: true })
    //get history
    const id = this.grid.dataSource[rowIndex]['id']
    this.rowIndex = rowIndex
    this.new_modal_data = this.grid.dataSource[rowIndex]
    const res = await api.client.getAdminHistory(id)
    this.setState({ historyData: res.data.data })
  }

  public onSaveDetailModal = async () => {
    let data = this.state.modalRow
    const rowIndex = this.grid.activeCell.rowIndex
    const rowId = this.grid.dataSource[this.rowIndex]?.id
    //save changed value
    if (this.state.modalRow['id']) {
      const res = await api.client.updateAdmin(this.state.modalRow['id'], data)
    } else {
      const res = await api.client.createAdmin(this.state.modalRow)
    }

    this.grid.notifySetItem(this.rowIndex, this.new_modal_data, data)
    this.setState({ openDetailModal: false })
    toast.success('保存されました。')
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
          if (key == '店舗名') {
            value = Array.isArray(value) ? value.map(String).join(', ') : value;
          }
          if (key == '権限設定') {
            value = ''
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

  public handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const value = event.target.value
    const checked = event.target.checked
    //checkedStore
    let temp_checkedStore = this.state.checkedStore
    switch (value) {
      case 'checkedStore1':
        temp_checkedStore[1] = checked
        break;
      case 'checkedStore2':
        temp_checkedStore[2] = checked
        break;
      case 'checkedStore3':
        temp_checkedStore[3] = checked
        break;
      case 'checkedStore4':
        temp_checkedStore[4] = checked
        break;
      case 'checkedStore5':
        temp_checkedStore[5] = checked
        break;
      case 'checkedStore6':
        temp_checkedStore[1] = checked
        temp_checkedStore[2] = checked
        temp_checkedStore[3] = checked
        temp_checkedStore[4] = checked
        temp_checkedStore[5] = checked
        temp_checkedStore[6] = checked
        break;

      default:
        console.log("Invalid checkedStore");
    }
    if (this.state.checkedStore[1] && this.state.checkedStore[2] && this.state.checkedStore[3] && this.state.checkedStore[4] && this.state.checkedStore[5])
      temp_checkedStore[6] = true
    else
      temp_checkedStore[6] = false
    this.setState({ checkedStore: temp_checkedStore })

    //checkedSale
    let temp_checkedSale = this.state.checkedSale
    switch (value) {
      case 'checkedSale1':
        temp_checkedSale[1] = checked
        break;
      case 'checkedSale2':
        temp_checkedSale[2] = checked
        break;
      case 'checkedSale3':
        temp_checkedSale[3] = checked
        break;
      case 'checkedSale4':
        temp_checkedSale[4] = checked
        break;
      case 'checkedSale5':
        temp_checkedSale[5] = checked
        break;
      case 'checkedSale6':
        temp_checkedSale[1] = checked
        temp_checkedSale[2] = checked
        temp_checkedSale[3] = checked
        temp_checkedSale[4] = checked
        temp_checkedSale[5] = checked
        temp_checkedSale[6] = checked
        break;

      default:
        console.log("Invalid checkedSale");
    }
    if (this.state.checkedSale[1] && this.state.checkedSale[2] && this.state.checkedSale[3] && this.state.checkedSale[4] && this.state.checkedSale[5])
      temp_checkedSale[6] = true
    else
      temp_checkedSale[6] = false
    this.setState({ checkedSale: temp_checkedSale })

    //checkedAdmin
    let temp_checkedAdmin = this.state.checkedAdmin
    switch (value) {
      case 'checkedAdmin1':
        temp_checkedAdmin[1] = checked
        break;
      case 'checkedAdmin2':
        temp_checkedAdmin[2] = checked
        break;
      case 'checkedAdmin3':
        temp_checkedAdmin[3] = checked
        break;
      case 'checkedAdmin4':
        temp_checkedAdmin[4] = checked
        break;
      case 'checkedAdmin5':
        temp_checkedAdmin[5] = checked
        break;
      case 'checkedAdmin6':
        temp_checkedAdmin[1] = checked
        temp_checkedAdmin[2] = checked
        temp_checkedAdmin[3] = checked
        temp_checkedAdmin[4] = checked
        temp_checkedAdmin[5] = checked
        temp_checkedAdmin[6] = checked
        break;

      default:
        console.log("Invalid checkedAdmin");
    }
    if (this.state.checkedAdmin[1] && this.state.checkedAdmin[2] && this.state.checkedAdmin[3] && this.state.checkedAdmin[4] && this.state.checkedAdmin[5])
      temp_checkedAdmin[6] = true
    else
      temp_checkedAdmin[6] = false
    this.setState({ checkedAdmin: temp_checkedAdmin })

    //checkedEmployee
    let temp_checkedEmployee = this.state.checkedEmployee
    switch (value) {
      case 'checkedEmployee1':
        temp_checkedEmployee[1] = checked
        break;
      case 'checkedEmployee2':
        temp_checkedEmployee[2] = checked
        break;
      case 'checkedEmployee3':
        temp_checkedEmployee[3] = checked
        break;
      case 'checkedEmployee4':
        temp_checkedEmployee[4] = checked
        break;
      case 'checkedEmployee5':
        temp_checkedEmployee[5] = checked
        break;
      case 'checkedEmployee6':
        temp_checkedEmployee[1] = checked
        temp_checkedEmployee[2] = checked
        temp_checkedEmployee[3] = checked
        temp_checkedEmployee[4] = checked
        temp_checkedEmployee[5] = checked
        temp_checkedEmployee[6] = checked
        break;

      default:
        console.log("Invalid checkedEmployee");
    }
    if (this.state.checkedEmployee[1] && this.state.checkedEmployee[2] && this.state.checkedEmployee[3] && this.state.checkedEmployee[4] && this.state.checkedEmployee[5])
      temp_checkedEmployee[6] = true
    else
      temp_checkedEmployee[6] = false
    this.setState({ checkedEmployee: temp_checkedEmployee })

    //checkedMaster
    let temp_checkedMaster = this.state.checkedMaster
    switch (value) {
      case 'checkedMaster1':
        temp_checkedMaster[1] = checked
        break;
      case 'checkedMaster2':
        temp_checkedMaster[2] = checked
        break;
      case 'checkedMaster3':
        temp_checkedMaster[3] = checked
        break;
      case 'checkedMaster4':
        temp_checkedMaster[4] = checked
        break;
      case 'checkedMaster5':
        temp_checkedMaster[5] = checked
        break;
      case 'checkedMaster6':
        temp_checkedMaster[1] = checked
        temp_checkedMaster[2] = checked
        temp_checkedMaster[3] = checked
        temp_checkedMaster[4] = checked
        temp_checkedMaster[5] = checked
        temp_checkedMaster[6] = checked
        break;

      default:
        console.log("Invalid checkedMaster");
    }
    if (this.state.checkedMaster[1] && this.state.checkedMaster[2] && this.state.checkedMaster[3] && this.state.checkedMaster[4] && this.state.checkedMaster[5])
      temp_checkedMaster[6] = true
    else
      temp_checkedMaster[6] = false
    this.setState({ checkedMaster: temp_checkedMaster })

    //checkedBoard
    let temp_checkedBoard = this.state.checkedBoard
    switch (value) {
      case 'checkedBoard1':
        temp_checkedBoard[1] = checked
        break;
      case 'checkedBoard2':
        temp_checkedBoard[2] = checked
        break;
      case 'checkedBoard3':
        temp_checkedBoard[3] = checked
        break;
      case 'checkedBoard4':
        temp_checkedBoard[4] = checked
        break;
      case 'checkedBoard5':
        temp_checkedBoard[5] = checked
        break;
      case 'checkedBoard6':
        temp_checkedBoard[1] = checked
        temp_checkedBoard[2] = checked
        temp_checkedBoard[3] = checked
        temp_checkedBoard[4] = checked
        temp_checkedBoard[5] = checked
        temp_checkedBoard[6] = checked
        break;

      default:
        console.log("Invalid checkedBoard");
    }
    if (this.state.checkedBoard[1] && this.state.checkedBoard[2] && this.state.checkedBoard[3] && this.state.checkedBoard[4] && this.state.checkedBoard[5])
      temp_checkedBoard[6] = true
    else
      temp_checkedBoard[6] = false
    this.setState({ checkedBoard: temp_checkedBoard })

    //checkedAccess
    let temp_checkedAccess = this.state.checkedAccess
    switch (value) {
      case 'checkedAccess1':
        temp_checkedAccess[1] = checked
        break;
      case 'checkedAccess2':
        temp_checkedAccess[2] = checked
        break;
      case 'checkedAccess3':
        temp_checkedAccess[3] = checked
        break;
      case 'checkedAccess4':
        temp_checkedAccess[4] = checked
        break;
      case 'checkedAccess5':
        temp_checkedAccess[5] = checked
        break;
      case 'checkedAccess6':
        temp_checkedAccess[1] = checked
        temp_checkedAccess[2] = checked
        temp_checkedAccess[3] = checked
        temp_checkedAccess[4] = checked
        temp_checkedAccess[5] = checked
        temp_checkedAccess[6] = checked
        break;

      default:
        console.log("Invalid checkedAccess");
    }
    if (this.state.checkedAccess[1] && this.state.checkedAccess[2] && this.state.checkedAccess[3] && this.state.checkedAccess[4] && this.state.checkedAccess[5])
      temp_checkedAccess[6] = true
    else
      temp_checkedAccess[6] = false
    this.setState({ checkedAccess: temp_checkedAccess })

    let data = this.state.modalRow
    data['権限設定'] = [
      this.state.checkedStore,
      this.state.checkedSale,
      this.state.checkedAdmin,
      this.state.checkedEmployee,
      this.state.checkedMaster,
      this.state.checkedBoard,
      this.state.checkedAccess,
    ]
    this.setState({ modalRow: data })


  };
}

