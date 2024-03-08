import React from "react";
import api from "src/api";
import Modal from "@material-ui/core/Modal";
import Papa, { ParseResult } from "papaparse";
import { ToastContainer, toast } from "react-toastify";
import {
  MenuItem,
  Box,
  Button,
  TextField,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import * as XLSX from "xlsx";

import { storetype, provincetype } from "src/constants/Store";

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
} from "igniteui-react-grids";

// importing localization data:
import { Localization } from "igniteui-react-core";
import {
  DataGridLocalizationJa,
  DataGridSummariesLocalizationJa,
  DataGridDateTimeColumnLocalizationJa,
  DataGridMultiColumnComboBoxLocalizationJa,
} from "src/constants/DataGridLocaleJa";

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();

export default class ShopManageTable extends React.Component<any, any> {
  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;

  //set value
  public userName = localStorage.getItem("userName");
  public userRole = localStorage.getItem("userRole");
  public permission = localStorage.getItem("permission").split(",");

  //const of style
  public defaultColumnMinWidth = 150;
  public imgColumnWidth = 300;
  public cornerRadius = 8;
  public rowHeight = 40;

  public old_modal_data = {} as any;
  public new_modal_data = {} as any;
  public rowIndex = 0;

  //date format
  public formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Tokyo",
  });

  constructor(props: any) {
    super(props);

    this.onGetData();

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

      modalRow: null,
      openDetailModal: false,
      openDeleteModal: false,

      total: 0,
    };

    Localization.register("DataGrid-en", new DataGridLocalizationJa());
    Localization.register(
      "DataVisualization-en",
      new DataGridSummariesLocalizationJa()
    );
    Localization.register(
      "Calendar-en",
      new DataGridDateTimeColumnLocalizationJa()
    );
    Localization.register(
      "MultiColumnComboBox-en",
      new DataGridMultiColumnComboBoxLocalizationJa()
    );
  }

  // loading more getting data end

  public onGetData = async () => {
    // loading params
    const params = {
      dataName: "shops",
    };
    // loading params end

    const res = await api.client.getShop(params);
    // check getting data status
    if (!res || res.status == 400) return;
    const temp = res.data.data;
    const total = res.data.total;

    let changedTypeData: any[] = [];

    temp.forEach((item: any) => {
      item["操作"] = 0;
      changedTypeData.push(item);
    });

    // getting result show
    this.setState({ data: changedTypeData });
    this.setState({ total: total });
    this.setState({ loading: false });
  };

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
        <div
          className="gird-container h-full"
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
        >
          {/* Header Button */}
          <Box className="flex flex-row justify-end">
            <div className="align-middle rounded-tl-lg rounded-tr-lg inline-block w-full px-4 py-4 overflow-hidden !bg-transparent">
              <div className="flex justify-between">
                検索結果 &nbsp;&nbsp;{this.state.total} 件
              </div>
            </div>
            <IgrDataGridToolbar ref={this.onToolbarRef} columnChooser="true" />
            <Button
              component="span"
              sx={{
                minWidth: 160,
                height: 34,
                color: "#fff !important",
                ":hover": {
                  color: "#000 !important",
                },
                fontFamily: "Meiryo",
                bgcolor: "#0066FF",
                border: 1,
                borderColor: "#24BFF2",
                borderRadius: 22,
                boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                marginRight: 0.5,
              }}
              onClick={(event) => {
                if (
                  this.permission[5] == "true" ||
                  this.userRole == "super_admin"
                ) {
                  event.preventDefault();
                  this.onExportExcel("店舗リスト");
                } else {
                  alert("権限が付与されていません。管理者に連絡してください。");
                }
              }}
            >
              Excelダウンロード
            </Button>
          </Box>

          <div className="flex flex-col relative igr-table h-full">
            {/* Table */}
            <IgrDataGrid
              ref={this.onGridRef}
              dataSource={this.state.data}
              primaryKey={["id"]}
              editMode={
                this.permission[3] == "true" || this.userRole == "super_admin"
                  ? 1
                  : 0
              }
              summaryScope="none"
              filterUIType="FilterRow"
              columnMovingMode={"none"}
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
              <IgrTextColumn field="店舗名" />
              <IgrComboBoxColumn field="店舗種別" dataSource={storetype} />
              <IgrTextColumn field="都道府県" />
              <IgrTextColumn field="住所" />
              <IgrTextColumn field="代理ログイン" />
              <IgrTemplateColumn
                field="操作"
                width={"150"}
                pinned="right"
                cellUpdating={this.onActionCellUpdating}
              />
            </IgrDataGrid>
            {/* Bottom Button */}
            <div
              className={`flex ${
                !this.state.addRowHidden && "hidden"
              } absolute overflow-x-auto overflow-y-hidden w-full bottom-[50px]`}
              onScroll={this.handleScroll}
              onClick={this.handlClick}
            >
              <input
                className="addRow-input !w-1/5"
                placeholder="店舗名"
                value={this.state.addRowData["店舗名"]}
                onChange={(event) =>
                  this.onChangedAddRow("店舗名", event.target.value)
                }
              />
              <div className="flex addRow-input !w-1/5">
                <Select
                  className="w-6/12 my-auto h-[34px] !w-[100%]"
                  value={
                    this.state.addRowData["店舗種別"]
                      ? this.state.addRowData["店舗種別"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("店舗種別", event.target.value)
                  }
                >
                  {storetype.map((item: any, key: number) => {
                    return (
                      <MenuItem
                        key={item.value + key}
                        value={item.value}
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
              <div className="flex addRow-input !w-1/5">
                <Select
                  className="w-6/12 my-auto h-[34px] !w-[100%]"
                  value={
                    this.state.addRowData["都道府県"]
                      ? this.state.addRowData["都道府県"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("都道府県", event.target.value)
                  }
                >
                  {provincetype.map((item: any, key: number) => {
                    return (
                      <MenuItem
                        key={item.value + key}
                        value={item.value}
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
              <input
                className="addRow-input !w-1/5"
                placeholder="住所"
                value={this.state.addRowData["住所"]}
                onChange={(event) =>
                  this.onChangedAddRow("住所", event.target.value)
                }
              />
              <input
                className="addRow-input !w-1/5"
                placeholder="代理ログイン"
                value={this.state.addRowData["代理ログイン"]}
                onChange={(event) =>
                  this.onChangedAddRow("代理ログイン", event.target.value)
                }
              />
              <div
                className="addRow-input !w-[150px] h-[35px] flex"
                placeholder="操作"
              />
            </div>
            {!this.state.addRowHidden ? (
              <Button
                className="flex mt-2 addBtn"
                sx={{
                  width: 93,
                  height: 37,
                  color: "#1A1A1A",
                  fontFamily: "Meiryo",
                  borderRadius: 8,
                  bgcolor: "#E6E6E6",
                }}
                onClick={this.onAddRow}
              >
                + 新規登録
              </Button>
            ) : (
              <div className="flex mt-5">
                <Button
                  className="flex addBtn"
                  sx={{
                    width: 93,
                    height: 37,
                    color: "#FFF",
                    fontFamily: "Meiryo",
                    borderRadius: 8,
                    bgcolor: "#0066FF",
                  }}
                  onClick={this.onAddRowSave}
                >
                  保 存
                </Button>
                <Button
                  className="flex addBtn !ml-2"
                  sx={{
                    width: 93,
                    height: 37,
                    color: "#FFF",
                    fontFamily: "Meiryo",
                    borderRadius: 8,
                    bgcolor: "#808080",
                  }}
                  onClick={this.onAddRowCancel}
                >
                  キャンセル
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Modal */}
        <Modal
          className="min-w-[876px]"
          open={this.state.openDetailModal}
          style={{
            position: "absolute",
            width: "40vw",
            margin: "auto",
            height: "80vh",
          }}
          onClose={() => {
            this.setState({ openDetailModal: false });
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full border-none">
            <div className="flex w-full h-[70px] px-[40px] bg-[#BCD8F1] rounded-t-[20px]">
              <h1 className="font-Meiryo text-[20px] my-auto">店舗詳細</h1>
            </div>
            <div className="bg-white p-10 overflow-y-auto rounded-b-[20px]">
              {/* 店舗名 & 支払口座 */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">店舗名</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["店舗名"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["店舗名"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">姓</label>
                  <TextField
                    className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["姓"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["姓"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">名</label>
                  <TextField
                    className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["名"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["名"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">姓（フリガナ）</label>
                  <TextField
                    className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["姓（フリガナ）"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["姓（フリガナ）"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">名（フリガナ）</label>
                  <TextField
                    className="w-6/12 my-auto"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["名（フリガナ）"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["名（フリガナ）"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">店舗種別</label>
                <Select
                  className="w-9/12 my-auto h-[34px]"
                  id="店舗種別"
                  value={this.state.modalRow?.["店舗種別"]}
                  onChange={(event: SelectChangeEvent) => {
                    let data = this.state.modalRow;
                    data["店舗種別"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                >
                  {storetype.map((item, key) => {
                    return (
                      <MenuItem value={`${item.value}`} key={`店舗種別${key}`}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>

              {/* 郵便番号 */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">郵便番号</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["郵便番号"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["郵便番号"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">都道府県</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["都道府県"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["都道府県"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* 住所 */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">住所</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["住所"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["住所"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              {/* 住所 */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">電話番号</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["電話番号"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["電話番号"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">口座名A</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["口座名A"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["口座名A"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">口座名B</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["口座名B"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["口座名B"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">口座名C</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["口座名C"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["口座名C"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">メールアドレス</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["メールアドレス"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["メールアドレス"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>
              {/* メールアドレス */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">
                  メールアドレス通知用
                </label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["メールアドレス通知用"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["メールアドレス通知用"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* History */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">変更履歴 </label>
                <div className="w-9/12 border-solid border-[0.6px] border-[#c4c4c4] rounded-[5px] overflow-y-auto p-3 h-[150px]">
                  {this.state.historyData?.map((element: any, key: any) => {
                    return (
                      <div key={`変更履歴${key}`}>
                        {element.updatedAt} : {element.updatedByUsername}
                        <br />
                        {element.field} :{" "}
                        {element.oldValue == "1/1/1970"
                          ? "空"
                          : element.oldValue}{" "}
                        &rarr;{" "}
                        {element.newValue == "1/1/1970"
                          ? "空"
                          : element.newValue}{" "}
                        <br />
                        <hr />
                        <br />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-center mx-auto w-full my-5 pr-5">
                <button
                  className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ openDetailModal: false });

                    const index = parseInt(
                      localStorage.getItem("old_modal_rowIndex"),
                      10
                    );
                    const old_modal_data = JSON.parse(
                      localStorage.getItem("old_modal_data")
                    );

                    let data = this.state.data;
                    data[index] = old_modal_data;

                    this.grid.notifyInsertItem(index, old_modal_data);
                  }}
                >
                  キャンセル
                </button>
                <button
                  className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault();
                    this.onSaveDetailModal();
                  }}
                >
                  保 存
                </button>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={this.state.openDeleteModal}
          style={{
            position: "absolute",
            margin: "auto",
            height: 194,
            width: 264,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-t-[10px]">
            <div className="flex w-full h-[40px] px-[30px] bg-[#BCD8F1] rounded-t-[10px]">
              <h1 className="font-Meiryo text-[14px] my-auto">類義語削除</h1>
            </div>
            <div className="flex flex-col m-auto">
              <h5 className="font-Meiryo text-[14px] my-[20px] mx-auto text-center">
                本当に削除しますか？
              </h5>
              <div className="flex flex-row justify-content">
                <button
                  className="w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ openDeleteModal: false });
                  }}
                >
                  いいえ
                </button>
                <button
                  className="w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault();
                    this.onDeleteRow();
                  }}
                >
                  は い
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  //IgrDataGrid methods
  public onGridRef = (grid: IgrDataGrid) => {
    if (!grid) {
      return;
    }

    this.grid = grid;
    if (!this.grid) {
      return;
    }

    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }
  };

  public onToolbarRef = (toolbar: IgrDataGridToolbar) => {
    this.toolbar = toolbar;
    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }
  };

  public onActionCellUpdating = (
    s: any,
    e: IgrTemplateCellUpdatingEventArgs
  ) => {
    const content = e.content as HTMLDivElement;
    content.style.display = "flex";
    content.style.padding = "5px";

    let span1: HTMLSpanElement | null = null;
    let span2: HTMLSpanElement | null = null;

    if (e.cellInfo.rowItem["操作"] == 1) {
      //save and cancel 1
      content.innerHTML = "";
      if (content.childElementCount === 0) {
        span1 = document.createElement("span");
        span1.textContent = "キャンセル";
        span1.style.backgroundColor = "#808080";
        span1.style.borderRadius = "5px";
        span1.style.height = "27px";
        span1.style.display = "flex";
        span1.style.alignItems = "center";
        span1.style.paddingInline = "2px";
        span1.style.color = "#FFFFFF";
        span1.style.margin = "auto";
        span1.style.cursor = "pointer";

        span1.onclick = (event) => {
          event.preventDefault();
          this.onCancelRow(e);
        };

        content.appendChild(span1);

        span2 = document.createElement("span");
        span2.textContent = "保存";
        span2.style.backgroundColor = "#0066FF";
        span2.style.borderRadius = "5px";
        span2.style.height = "27px";
        span2.style.display = "flex";
        span2.style.alignItems = "center";
        span2.style.paddingInline = "2px";
        span2.style.color = "#FFFFFF";
        span2.style.margin = "auto";
        span2.style.cursor = "pointer";

        span2.onclick = (event) => {
          event.preventDefault();
          this.onSaveRow(e);
        };

        content.appendChild(span2);
      } else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
      }
      // } else if (e.cellInfo.rowItem['操作'] == 2) {
    } else if (e.cellInfo.rowItem["操作"] == 0) {
      //Editable 2
      content.innerHTML = "";
      if (content.childElementCount === 0) {
        span1 = document.createElement("span");
        span1.textContent = "詳細";
        span1.style.color = "#0066FF";
        span1.onclick = (event) => {
          if (this.permission[3] == "true" || this.userRole == "super_admin") {
            event.preventDefault();

            e.cellInfo.rowItem["口座名A"] = e.cellInfo.rowItem["口座名a"];
            e.cellInfo.rowItem["口座名B"] = e.cellInfo.rowItem["口座名b"];
            e.cellInfo.rowItem["口座名C"] = e.cellInfo.rowItem["口座名c"];

            this.onOpenDetailModal(e.cellInfo.rowItem);
          } else {
            alert("権限が付与されていません。管理者に連絡してください。");
          }
        };
        span1.style.margin = "auto";
        span1.style.cursor = "pointer";

        content.appendChild(span1);

        span2 = document.createElement("span");
        span2.textContent = "削除";
        span2.style.color = "#F24024";
        span2.style.margin = "auto";
        span2.style.cursor = "pointer";

        span2.onclick = (e) => {
          if (this.permission[4] == "true" || this.userRole == "super_admin") {
            e.preventDefault();
            this.setState({ openDeleteModal: true });
          } else {
            alert("権限が付与されていません。管理者に連絡してください。");
          }
        };

        content.appendChild(span2);
      } else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
      }
    }
  };

  public changedHistoryData = [] as any;
  public onCellValueChanging = (
    s: IgrDataGrid,
    e: IgrGridCellValueChangingEventArgs
  ) => {
    const rowIndex = s.activeCell.rowIndex;
    const dataItem = s.actualDataSource.getItemAtIndex(rowIndex);
    const columnKey = e.column.field;

    let obj = {} as any;

    obj["rowIndex"] = rowIndex;
    obj["field"] = columnKey;
    obj["shop_name"] = dataItem["店舗名"];
    obj["old_value"] = e.oldValue;
    obj["new_value"] = e.newValue;
    obj["username"] = this.userName;

    this.changedHistoryData.push(obj);

    e.cellInfo.rowItem["操作"] = 1;
  };

  //cancel changed value
  public onCancelRow = (e: IgrTemplateCellUpdatingEventArgs) => {
    const rowIndex = this.grid.activeCell.rowIndex;
    e.cellInfo.rowItem["操作"] = 0;

    //set origin value
    let otherHistoryData = [] as any;
    this.changedHistoryData.forEach((element: any) => {
      if (rowIndex == element["rowIndex"]) {
        let data = [...this.state.data];
        data[rowIndex][element["field"]] = element["old_value"];
        this.setState({ data: data });
      } else {
        otherHistoryData.push(element);
      }
    });

    this.changedHistoryData = otherHistoryData;
  };

  //save changed value
  public onSaveRow = async (e: IgrTemplateCellUpdatingEventArgs) => {
    e.cellInfo.rowItem["操作"] = 0;
    //save changed value
    if (e.cellInfo.rowItem["id"]) {
      const res = await api.client.updateShop(
        e.cellInfo.rowItem["id"],
        e.cellInfo.rowItem
      );

      //add update history
      let ownHistoryData = [] as any;
      let otherHistoryData = [] as any;
      this.changedHistoryData.forEach((element: any) => {
        if (e.cellInfo.rowItem["店舗名"] == element["shop_name"]) {
          ownHistoryData.push(element);
        } else {
          otherHistoryData.push(element);
        }
      });

      const res_history = await api.client.updateShopHistory(
        e.cellInfo.rowItem["id"],
        ownHistoryData
      );
      this.changedHistoryData = otherHistoryData;
    } else {
      const res = await api.client.createShop(e.cellInfo.rowItem);
    }

    toast.success("保存されました。");
  };

  //delete selected row
  public onDeleteRow = async () => {
    // Make a copy of data array
    let data = [...this.state.data];

    this.activeRowIndex = this.grid.activeCell.rowIndex;

    const row = data[this.activeRowIndex];
    const res = await api.client.deleteShop(row["id"]);

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ openDeleteModal: false });
  };

  //add new row
  public onAddRow = () => {
    if (this.permission[2] == "true" || this.userRole == "super_admin") {
      const new_data = {
        店舗名: "",
        店舗種別: "",
        都道府県: "",
        住所: "",
        代理ログイン: "",
        操作: 0,
      };
      this.setState({ addRowData: new_data });
      this.setState({ addRowHidden: true });
      this.grid.scrollTo(0, 10000000);
    } else {
      alert("権限が付与されていません。管理者に連絡してください。");
    }
  };

  public handleScroll = (event: any) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    this.grid.scrollTo(scrollLeft, 10000000);
  };

  public onChangedAddRow = (field: string, value: any) => {
    let data = this.state.addRowData;

    data[field] = value;

    this.setState({ addRowData: data });
  };

  public onAddRowSave = async () => {
    try {
      const res = await api.client.createShop(this.state.addRowData);
      if (res.status == 201) {
        let data = this.state.data;
        let temp = this.state.addRowData;
        temp["id"] = res.data.id;
        data.push(temp);
        this.grid.notifyInsertItem(data.length - 1, this.state.addRowData);
        this.setState({ total: this.state.total + 1 });
        toast.success("保存されました。");
      } else {
        toast.error("保存が失敗しました。");
      }
    } catch (err) {
      toast.error("予期しないエラー発生しました。");
    }

    this.setState({ isAddRow: false });
    this.setState({ addRowHidden: false });
  };

  public onAddRowCancel = () => {
    this.setState({ isAddRow: false });
    this.setState({ addRowHidden: false });
  };

  //key event
  public onKeyDown = (event: any) => {
    let data = this.state.data;

    if (event.ctrlKey && event.code === "KeyC") {
      this.activeRowIndex = this.grid.activeCell.rowIndex;
      this.setState({
        copiedRowIndex: this.activeRowIndex,
        copiedRow: data[this.activeRowIndex],
      });
    }
  };
  public onKeyUp = (event: any) => {
    if (this.grid.activeCell == null || this.state.copiedRow == null) return;

    let data = [...this.state.data]; // Make a copy of data array

    if (event.ctrlKey && event.code === "KeyV") {
      if (!this.state.isAddRowFocused) {
        this.activeRowIndex = this.grid.activeCell.rowIndex;
        const rowId = data[this.activeRowIndex]["id"];

        // Remove the original row from the array
        data.splice(this.activeRowIndex, 1);

        // Create a new object with the copied row data
        const newRowData = { ...this.state.copiedRow };
        newRowData["id"] = rowId;
        newRowData["操作"] = 1;

        // Insert the new row at the active row index
        data.splice(this.activeRowIndex, 0, newRowData);

        this.setState({ data: data });
        this.grid.notifyInsertItem(this.activeRowIndex, 1);

        //set history
        let obj = {} as any;

        obj["field"] = "コピー済み";
        obj["username"] = this.userName;

        this.changedHistoryData.push(obj);
      } else {
        const newRowData = { ...this.state.copiedRow };

        this.setState({ addRowData: newRowData });
        this.setState({ isAddRowFocused: false });
        this.setState({ copiedRow: null });
      }
    }
  };

  public handlClick = async (event: any) => {
    this.setState({ isAddRowFocused: true });
  };

  //open detail modal
  public onOpenDetailModal = async (row: any) => {
    const rowIndex = this.grid.activeCell.rowIndex;

    localStorage.setItem("old_modal_rowIndex", rowIndex.toString());
    localStorage.setItem(
      "old_modal_data",
      JSON.stringify(this.grid.dataSource[rowIndex])
    );

    this.setState({ modalRow: this.grid.dataSource[rowIndex] });
    this.setState({ openDetailModal: true });
    //get history
    const id = this.grid.dataSource[rowIndex]["id"];

    this.rowIndex = rowIndex;
    this.new_modal_data = this.grid.dataSource[rowIndex];
    const res = await api.client.getShopHistory(id);
    this.setState({ historyData: res.data.data });
  };

  public onSaveDetailModal = async () => {
    let data = this.state.modalRow;
    const rowIndex = this.grid.activeCell.rowIndex;
    const rowId = this.grid.dataSource[this.rowIndex]?.id;
    //save changed value
    if (this.state.modalRow["id"]) {
      // data['書類'] = this.state.data[rowIndex]['書類']
      const res = await api.client.updateShop(this.state.modalRow["id"], data);
    } else {
      const res = await api.client.createShop(this.state.modalRow);
    }

    this.grid.notifySetItem(this.rowIndex, this.new_modal_data, data);
    this.setState({ openDetailModal: false });
    toast.success("保存されました。");
  };

  public onExportExcel = (t: string) => {
    let data = [] as any;

    this.state.data.forEach((element: any, index: number) => {
      const arr = [] as any;
      const title = [] as any;

      Object.entries(element).map(([key, value]) => {
        if (key != "$hashCode" && key != "id" && key != "操作" && key != "v") {
          if (index == 0) {
            title.push(key);
          }
          arr.push(value);
        }
      });
      if (index == 0) {
        data.push(title);
      }
      data.push(arr);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // // Cast the mergeRanges array to Range[] type
    // worksheet['!merges'] = mergeRanges as XLSX.Range[];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, t + ".xlsx");
  };

  public currencyFormatter = (number: number | bigint) => {
    return new Intl.NumberFormat("en-JP", {
      style: "currency",
      currency: "JPY",
    }).format(number);
  };
}
