import React from "react";
import api from "src/api";
import Modal from "@material-ui/core/Modal";
import Papa, { ParseResult } from "papaparse";
import { ToastContainer, toast } from "react-toastify";
import DragDropImage from "src/components/DragDropImage";
import { DatePickerValue } from "src/components/DatePicker";
import {
  MenuItem,
  Box,
  Button,
  TextField,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import * as XLSX from "xlsx";

import { storetype } from "src/constants/Store";

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
  IgrDateTimeColumn,
  IgrTemplateColumn,
  IgrImageColumn,
  IgrTemplateCellInfo,
  IgrDataGridColumn,
} from "igniteui-react-grids";

// importing localization data:
import { IMAGE_PATH } from "src/configs/AppConfig";
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

export default class BoardManageTable extends React.Component<any, any> {
  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;

  //set value
  public IMAGE_PATH = IMAGE_PATH;
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

    this.state = {
      data: [],
      images: [],
      loading: true,
      copiedRow: null,
      historyData: null,
      copiedRowIndex: null,

      addRowData: {},
      isAddRow: false,
      isAddRowFocused: false,
      addRowHidden: false,

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

      total: 0,
      storeName: [],
      choosedStoreName: [""],
    };

    this.onGetData();
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
      dataName: "salers",
    };
    // loading params end

    const res = await api.client.getBoard(params);
    // check getting data status
    if (res.status == 400) return;
    const temp = res.data.data;
    const total = res.data.total;

    let changedTypeData: any[] = [];

    temp.forEach((item: any) => {
      item["日付"] = item["日付"] ? new Date(item["日付"]) : null;
      item["公開開始日時"] = item["公開開始日時"]
        ? new Date(item["公開開始日時"])
        : null;
      item["公開終了日時"] = item["公開終了日時"]
        ? new Date(item["公開終了日時"])
        : null;
      item["操作"] = 0;
      changedTypeData.push(item);
    });
    const temp_storeName = res.data.storeName;

    let storeName = [] as any;
    temp_storeName.forEach((element: { id: any; 店舗名: any }) => {
      storeName.push({ value: element.店舗名, key: element.id });
    });
    // getting result show
    this.setState({ data: changedTypeData });
    this.setState({ total: total });
    this.setState({ storeName: storeName });
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
                  this.permission[40] == "true" ||
                  this.userRole == "super_admin"
                ) {
                  event.preventDefault();
                  this.onExportExcel("掲示板一覧");
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
                this.permission[38] == "true" || this.userRole == "super_admin"
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
              <IgrDateTimeColumn
                field="日付"
                isEditable={true}
                dateTimeFormat={0}
                formatOverride={this.formatter}
                width={"*>180"}
              />
              <IgrTextColumn field="タイトル" />
              <IgrTextColumn field="本文" />
              <IgrDateTimeColumn
                field="公開開始日時"
                isEditable={true}
                dateTimeFormat={0}
                formatOverride={this.formatter}
                width={"*>180"}
              />
              <IgrDateTimeColumn
                field="公開終了日時"
                isEditable={true}
                dateTimeFormat={0}
                formatOverride={this.formatter}
                width={"*>180"}
              />
              <IgrComboBoxColumn
                field="店舗種別"
                dataSource={storetype}
                width={"*>180"}
              />
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
              } absolute overflow-x-auto overflow-y-hidden w-full bottom-[50px] hover:z-[10001]`}
              onScroll={this.handleScroll}
              onClick={this.handlClick}
            >
              <div className="flex addRow-input !w-1/6 min-w-[150px]">
                <DatePickerValue
                  date={this.state.addRowData["日付"]}
                  onChange={(value: any) => this.onChangedAddRow("日付", value)}
                />
              </div>

              <input
                className="flex addRow-input !w-1/6 min-w-[150px]"
                placeholder="タイトル"
                value={this.state.addRowData["タイトル"]}
                onChange={(event) =>
                  this.onChangedAddRow("タイトル", event.target.value)
                }
              />
              <input
                className="flex addRow-input !w-1/6 min-w-[150px]"
                placeholder="本文"
                value={this.state.addRowData["本文"]}
                onChange={(event) =>
                  this.onChangedAddRow("本文", event.target.value)
                }
              />

              <div className="flex addRow-input !w-1/6 min-w-[150px]">
                <DatePickerValue
                  date={this.state.addRowData["公開開始日時"]}
                  onChange={(value: any) =>
                    this.onChangedAddRow("公開開始日時", value)
                  }
                />
              </div>
              <div className="flex addRow-input !w-1/6 min-w-[150px]">
                <DatePickerValue
                  date={this.state.addRowData["公開終了日時"]}
                  onChange={(value: any) =>
                    this.onChangedAddRow("公開終了日時", value)
                  }
                />
              </div>

              <div className="flex addRow-input !w-1/6 min-w-[150px]">
                <Select
                  className="w-6/12 my-auto h-[34px] !w-[100%]"
                  value={
                    this.state.addRowData["店舗種別"]
                      ? this.state.addRowData["店舗種別"]
                      : "在籍中"
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
              <div
                className="flex addRow-input !w-1/6 min-w-[150px]"
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
          open={this.state.openAddModal}
          style={{
            position: "absolute",
            margin: "auto",
            height: 600,
            width: 625,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[11px]">
            <div className="flex w-full py-[10px] px-[40px] bg-primary rounded-t-[10px]">
              <h1 className="w-full font-Meiryo text-white text-[20px] my-auto font-bold">
                画像アップロード
              </h1>
            </div>
            <DragDropImage value={this.onChangeImages} />
            <div className="flex justify-center absolute bottom-5 mx-auto w-full">
              <button
                className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-gray items-center"
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({ openAddModal: false });
                }}
              >
                キャンセル
              </button>
              <button
                className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1 items-center"
                onClick={(e) => {
                  e.preventDefault();
                  this.onUploadImages();
                }}
              >
                保 存
              </button>
            </div>
          </div>
        </Modal>
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
              <h1 className="font-Meiryo text-[20px] my-auto">掲示板詳細</h1>
            </div>
            <div className="bg-white p-10 overflow-y-auto rounded-b-[20px]">
              {/* Date & Time */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">日付</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue
                      date={this.state.modalRow?.["日付"]}
                      onChange={(value: any) => {
                        const tempY = value?.$d?.getFullYear();
                        const tempM = value?.$d?.getMonth() + 1;
                        const tempD = value?.$d?.getDate();
                        const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempY + "-" + tempM + "-" + tempD)) {
                          let data = this.state.modalRow;
                          data["日付"] = new Date(
                            value.toLocaleString("ja-JP")
                          );
                          this.setState({ modalRow: data });
                        }
                      }}
                    />
                  </div>
                  <IconButton
                    aria-label="cancel"
                    className="!ml-[-10px]"
                    onClick={() => this.onEraseDatePicker(1)}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
                <div className="flex w-full pr-5"></div>
              </div>
              {/* タイトル & 支払口座 */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">タイトル</label>
                <TextField
                  className="w-9/12 my-auto"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["タイトル"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["タイトル"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* text */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">本文 </label>
                <TextField
                  className="w-[78%] my-auto"
                  multiline
                  rows={2}
                  value={this.state.modalRow?.["本文"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["本文"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* Image & Context */}
              <div className="flex w-full my-5">
                <div className="flex flex-row w-full pr-5">
                  <label className="w-3/12 pl-10">画像</label>
                  <div className="flex flex-col w-9/12">
                    <div className="max-h-[200px] overflow-y-auto">
                      {/* image */}
                      {this.state.modalRow?.["画像"]?.map(
                        (image: any, key: number) => {
                          let img =
                            typeof image == "string" ? image.slice(19, 58) : "";
                          return (
                            <div
                              className="flex justify-between w-full mx-auto my-3"
                              key={`images-${key}`}
                            >
                              <div className="flex w-10/12">
                                <div className="file-image">
                                  <img
                                    src={`${this.IMAGE_PATH}${image}`}
                                    alt=""
                                  />
                                </div>
                                <h5 className="my-auto">{`${img}`}</h5>
                              </div>

                              <img
                                className="cursor-pointer"
                                src="assets/icons/Close.svg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  let modalRow = this.state.modalRow;
                                  modalRow["画像"].splice(key, 1);
                                  this.setState({ modalRow: modalRow });
                                }}
                              />
                            </div>
                          );
                        }
                      )}
                      {this.state.modalImages?.map(
                        (image: any, key: number) => {
                          let img =
                            typeof image == "string" ? image.slice(19, 58) : "";
                          return (
                            <div
                              className="flex justify-between w-full mx-auto my-3"
                              key={`images-${key}`}
                            >
                              <div className="flex w-10/12">
                                <div className="file-image">
                                  <img
                                    src={`${this.IMAGE_PATH}temp/${image}`}
                                    alt=""
                                  />
                                </div>
                                <h5 className="my-auto">{`${img}`}</h5>
                              </div>
                              <img
                                className="cursor-pointer"
                                src="assets/icons/Close.svg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  let modalImages = this.state.modalImages;
                                  modalImages.splice(key, 1);
                                  let modalComments = this.state.modalComments;
                                  modalComments.splice(key, 1);
                                  this.setState({ modalImages: modalImages });
                                  this.setState({
                                    modalComments: modalComments,
                                  });
                                }}
                              />
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div
                      className="flex justify-evenly text-[12px] border border-[#24BFF2] bg-[#BCD8F1] rounded-[22px] w-[130px] h-[25px] my-2 justify-center text-center font-Meiryo cursor-pointer"
                      onClick={() => {
                        this.setState({ isModalRow: true });
                        this.setState({ openAddModal: true });
                      }}
                    >
                      <span className="flex items-center w-[16px] h-[16px] border rounded-[5px] justify-center text-center my-auto">
                        +
                      </span>
                      <span className="my-auto">アップロード</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start w-full">
                <div className="flex w-full pr-5">
                  <label className="w-1/2 my-auto pl-10">店舗種別</label>
                  <Select
                    className="w-1/2 my-auto h-[34px]"
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
                        <MenuItem
                          value={`${item.value}`}
                          key={`店舗種別${key}`}
                        >
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-1/2 pl-10 pt-1">店舗追加</label>
                  <div className="w-1/2 justify-between">
                    {this.state.choosedStoreName?.map(
                      (item: any, key: number) => {
                        return (
                          <div key={key} className="flex mb-1">
                            <Select
                              className="w-full h-[34px]"
                              id="店舗名"
                              value={this.state.modalRow?.["店舗名"]?.[key]}
                              onChange={(event: SelectChangeEvent) => {
                                let data = this.state.modalRow;
                                let temp_choosedStoreName =
                                  this.state.choosedStoreName;

                                temp_choosedStoreName[key] = event.target.value;
                                data["店舗名"] = temp_choosedStoreName;

                                this.setState({ modalRow: data });
                                this.setState({
                                  choosedStoreName: temp_choosedStoreName,
                                });
                              }}
                            >
                              {this.state.storeName.map(
                                (
                                  item: {
                                    key: any;
                                    value: string;
                                  },
                                  key: any
                                ) => {
                                  return (
                                    <MenuItem
                                      value={`${item.value}`}
                                      key={`${key}`}
                                    >
                                      {item.value}
                                    </MenuItem>
                                  );
                                }
                              )}
                            </Select>
                            <div
                              className={`cursor-pointer mt-[5px] ml-[5px] ${
                                key == 0 && "hidden"
                              }`}
                            >
                              <img
                                className="w-[25px] h-[25px]"
                                src="assets/icons/Close.svg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  let temp_choosedStoreName =
                                    this.state.choosedStoreName;
                                  temp_choosedStoreName.splice(key, 1);
                                  this.setState({
                                    choosedStoreName: temp_choosedStoreName,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                    <div
                      className="flex text-[25px] my-2 justify-center cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();

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

                        if (
                          this.state.storeName.length ==
                          this.state.choosedStoreName.length
                        )
                          return;
                        let temp_choosedStoreName = this.state.choosedStoreName;
                        temp_choosedStoreName.push("");
                        this.setState({
                          choosedStoreName: temp_choosedStoreName,
                        });
                      }}
                    >
                      <span className="flex items-center w-[30px] h-[30px] border-black-900 rounded-[5px] justify-center text-center my-auto">
                        +
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 公開日時 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">公開日時</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue
                      date={this.state.modalRow?.["公開開始日時"]}
                      onChange={(value: any) => {
                        const tempY = value?.$d?.getFullYear();
                        const tempM = value?.$d?.getMonth() + 1;
                        const tempD = value?.$d?.getDate();
                        const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempY + "-" + tempM + "-" + tempD)) {
                          let data = this.state.modalRow;
                          data["公開開始日時"] = new Date(
                            value.toLocaleString("ja-JP")
                          );
                          this.setState({ modalRow: data });
                        }
                        if (value == null) {
                          let data = this.state.modalRow;
                          data["公開開始日時"] = null;
                          this.setState({ modalRow: data });
                        }
                      }}
                    />
                  </div>
                  <IconButton
                    aria-label="cancel"
                    className="!ml-[-10px]"
                    onClick={() => this.onEraseDatePicker(2)}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10"></label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue
                      date={this.state.modalRow?.["公開終了日時"]}
                      onChange={(value: any) => {
                        const tempY = value?.$d?.getFullYear();
                        const tempM = value?.$d?.getMonth() + 1;
                        const tempD = value?.$d?.getDate();
                        const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempY + "-" + tempM + "-" + tempD)) {
                          let data = this.state.modalRow;
                          data["公開終了日時"] = new Date(
                            value.toLocaleString("ja-JP")
                          );
                          this.setState({ modalRow: data });
                        }
                        if (value == null) {
                          let data = this.state.modalRow;
                          data["公開終了日時"] = null;
                          this.setState({ modalRow: data });
                        }
                      }}
                    />
                  </div>
                  <IconButton
                    aria-label="cancel"
                    className="!ml-[-10px]"
                    onClick={() => this.onEraseDatePicker(3)}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
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
              <h1 className="font-Meiryo text-[14px] my-auto">削除</h1>
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
          if (this.permission[38] == "true" || this.userRole == "super_admin") {
            event.preventDefault();
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
          if (this.permission[39] == "true" || this.userRole == "super_admin") {
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
    obj["board_title"] = dataItem["タイトル"];
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
      const res = await api.client.updateBoard(
        e.cellInfo.rowItem["id"],
        e.cellInfo.rowItem
      );

      //add update history
      let ownHistoryData = [] as any;
      let otherHistoryData = [] as any;
      this.changedHistoryData.forEach((element: any) => {
        if (e.cellInfo.rowItem["タイトル"] == element["board_title"]) {
          ownHistoryData.push(element);
        } else {
          otherHistoryData.push(element);
        }
      });

      const res_history = await api.client.updateBoardHistory(
        e.cellInfo.rowItem["id"],
        ownHistoryData
      );
      this.changedHistoryData = otherHistoryData;
    } else {
      const res = await api.client.createBoard(e.cellInfo.rowItem);
    }

    toast.success("保存されました。");
  };

  //delete selected row
  public onDeleteRow = async () => {
    // Make a copy of data array
    let data = [...this.state.data];

    this.activeRowIndex = this.grid.activeCell.rowIndex;

    const row = data[this.activeRowIndex];
    const res = await api.client.deleteBoard(row["id"]);

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ openDeleteModal: false });
  };

  //add new row
  public onAddRow = () => {
    if (this.permission[37] == "true" || this.userRole == "super_admin") {
      const date_one_month_later = new Date();
      date_one_month_later.setMonth(date_one_month_later.getMonth() + 1);
      console.log("this is afer one month");
      console.log(date_one_month_later);
      const new_data = {
        日付: new Date(),
        タイトル: "",
        本文: "",
        店舗名: [""],
        公開開始日時: new Date(),
        公開終了日時: date_one_month_later,
        店舗種別: "",
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
      const res = await api.client.createBoard(this.state.addRowData);
      if (res.status == 201) {
        let data = this.state.data;
        let temp = this.state.addRowData;

        temp["id"] = res.data.id;
        temp["日付"] = new Date(temp["日付"]);
        temp["公開開始日時"] = new Date(temp["公開開始日時"]);
        temp["公開終了日時"] = new Date(temp["公開終了日時"]);

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
    this.setState({
      choosedStoreName: this.grid.dataSource[rowIndex]["店舗名"],
    });
    this.setState({ openDetailModal: true });

    //get history
    const id = this.grid.dataSource[rowIndex]["id"];

    this.rowIndex = rowIndex;
    this.new_modal_data = this.grid.dataSource[rowIndex];
    const res = await api.client.getBoardHistory(id);
    this.setState({ historyData: res.data.data });
  };

  public onSaveDetailModal = async () => {
    let data = this.state.modalRow;
    data["画像"] = data["画像"]?.concat(this.state.modalImages);

    //save changed value
    if (this.state.modalRow["id"]) {
      const res = await api.client.updateBoard(this.state.modalRow["id"], data);
    } else {
      const res = await api.client.createBoard(this.state.modalRow);
    }

    this.grid.notifySetItem(this.rowIndex, this.new_modal_data, data);
    this.setState({ modalImages: null });
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

  public onCheckboxCellUpdating = (
    s: IgrTemplateColumn,
    e: IgrTemplateCellUpdatingEventArgs
  ) => {
    const content = e.content as HTMLDivElement;
    content.style.display = "flex";
    content.style.padding = "5px";

    let checkbox: HTMLInputElement | null = null;
    if (content.childElementCount === 0) {
      //  Create the checkbox element
      checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.width = "25px";
      checkbox.style.height = "25px";
      checkbox.style.margin = "auto";
      checkbox.style.padding = "auto";
      //  Set the attributes of the checkbox
      const field = s.props.field;
      checkbox.checked = e.cellInfo.rowItem[field];

      //  Append the container to the desired location on your webpage
      content.appendChild(checkbox);
    } else {
      checkbox = content.children[0] as HTMLInputElement;
    }

    checkbox.onclick = () => {
      console.log(checkbox.checked);
      e.cellInfo.rowItem["操作"] = 1;
    };
  };

  public onEraseDatePicker = (type: number) => {
    let data = this.state.modalRow;
    if (type == 1) data["取引日"] = null;
    else if (type == 2) data["卸日"] = null;
    else if (type == 3) data["入金日"] = null;
    this.setState({ modalRow: { ...data } });
  };

  public onChangeImages = (value: any) => {
    if (this.state.openDetailModal) this.setState({ tempImages: value });
    else this.setState({ images: value });
  };

  //upload Image
  public onUploadImages = async () => {
    this.setState({ loading: true });
    let rowId: any;
    let rowIndex: number;
    let uploadImage = {} as any;

    if (this.state.openDetailModal) uploadImage = this.state.tempImages;
    else uploadImage = this.state.images;

    if (this.state.isAddRow || this.state.isModalRow) rowId = "isAddRow";
    else {
      rowIndex = this.activeRowIndex;
      rowId = this.grid.dataSource[rowIndex]?.id;
    }
    console.log(rowIndex);
    console.log(rowId);

    await api.client
      .imageUpload({ id: rowId, files: uploadImage })
      .then((response: any) => {
        // Handle the response
        if (response.data.success === true) {
          if (this.state.isAddRow) {
            let rowData = this.state.addRowData;
            rowData["画像"] = rowData["画像"]?.concat(response.data.data);

            this.setState({ images: rowData["画像"] });
            this.setState({ addRowData: rowData });
          } else if (this.state.isModalRow) {
            let images = this.state.modalImages;
            let comments = [] as any;
            images = images?.concat(response.data.data);
            response.data.data.forEach((e: any) => {
              comments.push("");
            });
            this.setState({ modalImages: images });
          } else {
            let data = this.state.data;
            data[rowIndex]["画像"] = response.data.data;
            this.setState({ data: data });
            this.setState({ images: data[rowIndex]["画像"] });
            this.grid.notifyInsertItem(rowIndex, 1);
          }

          this.setState({ isAddRow: false });
          this.setState({ isModalRow: false });
          this.setState({ loading: false });

          toast.success("画像アップロードに成功しました！");
          this.setState({ openAddModal: false });
        }
      });

    this.setState({ tempImages: null });
  };

  public onRemoveImages = async () => {
    let rowId: any;
    let rowIndex: number;

    if (this.state.isAddRow) rowId = "isAddRow";
    else {
      rowIndex = this.grid.activeCell.rowIndex;
      rowId = this.grid.dataSource[rowIndex]?.id;
    }

    await api.client
      .imageRemove({ id: rowId, files: this.state.images })
      .then((response: any) => {
        // Handle the response
        if (response.data.success === true) {
          this.setState({ openRemoveModal: false });
          if (this.state.isAddRow) {
            let rowData = this.state.addRowData;
            rowData["画像"] = response.data.data;
            this.setState({ addRowData: rowData });
          } else {
            let data = this.state.data;
            data[rowIndex]["画像"] = response.data.data;
            this.setState({ data: data });
            this.grid.notifyInsertItem(rowIndex, 1);
          }
        }
      });
  };
}
