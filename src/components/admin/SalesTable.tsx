import React from "react";
import api from "src/api";
import ReactDOM from "react-dom";
import Modal from "@material-ui/core/Modal";
import Papa, { ParseResult } from "papaparse";
import { ToastContainer, toast } from "react-toastify";
import DragDropImage from "src/components/DragDropImage";
import { DatePickerValue } from "src/components/DatePicker";
import { TimePickerValue } from "src/components/TimePicker";
import { MenuItem, Box, Button, TextField, Select } from "@mui/material";
import * as XLSX from "xlsx";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
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
  IgrFilterOperand,
  EditorType,
  IgrGridCustomFilterRequestedEventArgs,
  IgrGridFilterExpressionsEventArgs,
} from "igniteui-react-grids";

// importing localization data:
import { IMAGE_PATH } from "src/configs/AppConfig";
import { Localization } from "igniteui-react-core";
import {
  contracts,
  gender,
  reasonA,
  reasonB,
  productA,
  productB,
  brands,
  ranks,
  metals,
  sales,
  payments,
} from "src/constants/SalesOptions";
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

export default class SalesTable extends React.Component<any, any> {
  public grid: IgrDataGrid;
  public activeRowIndex: number;
  public toolbar: IgrDataGridToolbar;
  public addRowData: any = null;

  //set value
  public IMAGE_PATH = IMAGE_PATH;
  public userName = localStorage.getItem("userName");

  //const of style
  public defaultColumnMinWidth = 150;
  public imgColumnWidth = 200;
  public cornerRadius = 8;
  public rowHeight = 40;

  //contants
  public productA_api = [] as any;
  public productB_api = [] as any;
  public ranks_api = [] as any;
  public brands_api = [] as any;
  public reasonA_api = [] as any;
  public reasonB_api = [] as any;

  public old_modal_data = {} as any;
  public new_modal_data = {} as any;
  public rowIndex = 0;

  // pointer track
  public pointer = 0;
  public PAGE_SIZE = 1000; // Define the number of records to load per page
  public tempData: any[] = [];
  public Request_Status = 0;
  public show_saveButton = false;
  // total
  public purchaseAmount = 0;
  public salesAmount = 0;
  public shipAmount = 0;
  public total = 0;

  //date format
  public formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Tokyo",
  });

  constructor(props: any) {
    super(props);
    // this.purchaseAmount = this.purchaseAmount.bind(this)

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
      isAddRowFocused: false,
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

      total: 0,
      purchaseAmount: 0,
      salesAmount: 0,
      shipAmount: 0,

      storeName:
        props.storeName == ""
          ? localStorage.getItem("storeName").split(",")[0]
          : props.storeName,
      storeNames: [],
      choosedStoreName: "",
      choosedExcelFile: null,
    };

    this.onGetConstants();
    this.onSumData();
    this.onGetData();

    Localization.register("DataGrid-ja", new DataGridLocalizationJa());
    Localization.register(
      "DataVisualization-ja",
      new DataGridSummariesLocalizationJa()
    );
    Localization.register(
      "Calendar-ja",
      new DataGridDateTimeColumnLocalizationJa()
    );
    Localization.register(
      "MultiColumnComboBox-ja",
      new DataGridMultiColumnComboBoxLocalizationJa()
    );
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.storeName !== prevProps.storeName) {
      // Perform any actions you need when storeName changes
      this.setState({ storeName: this.props.storeName });
      setTimeout(() => {
        this.pointer = 0;
        this.setState({
          total: 0,
          purchaseAmount: 0,
          salesAmount: 0,
          shipAmount: 0,
        });
        this.onGetConstants();
        this.onSumData();
        this.onGetData();
      }, 500);
    }
  }

  // loading more getting data
  public loadMore = async () => {
    this.pointer = this.pointer + this.PAGE_SIZE;
    this.onGetData();
  };
  // loading more getting data end

  public onGetConstants = async () => {
    let arr = [] as any;
    //productA
    const resultA = await api.client.getMasterContants({
      category: "商品カテゴリ",
      storeName: this.state.storeName,
    });
    resultA.data.data.forEach((element: any) => {
      arr.push({
        value: element.itemName,
      });
    });
    this.productA_api = arr;

    arr = [] as any;
    //productB
    const resultB = await api.client.getMasterContants({
      category: "商品シリーズ",
      storeName: this.state.storeName,
    });
    resultB.data.data.forEach((element: any) => {
      arr.push({
        value: element.itemName,
      });
    });
    this.productB_api = arr;

    arr = [] as any;
    //rank
    const resultRank = await api.client.getMasterContants({
      category: "商品ランク",
      storeName: this.state.storeName,
    });
    resultRank.data.data.forEach((element: any) => {
      arr.push({
        value: element.itemName,
      });
    });
    this.ranks_api = arr;

    arr = [] as any;
    //brands
    const resultBrands = await api.client.getMasterContants({
      category: "ブランド",
      storeName: this.state.storeName,
    });
    resultBrands.data.data.forEach((element: any) => {
      arr.push({
        value: element.itemName,
      });
    });
    this.brands_api = arr;

    arr = [] as any;
    //reasonA
    const resultReasonA = await api.client.getMasterContants({
      category: "来店動機A",
      storeName: this.state.storeName,
    });
    resultReasonA.data.data.forEach((element: any) => {
      arr.push({
        value: element.itemName,
      });
    });
    this.reasonA_api = arr;

    arr = [] as any;
    //reasonB
    const resultReasonB = await api.client.getMasterContants({
      category: "来店動機B",
      storeName: this.state.storeName,
    });
    resultReasonB.data.data.forEach((element: any) => {
      arr.push({
        value: element.itemName,
      });
    });
    this.reasonB_api = arr;
  };

  public onSumData = async () => {
    const { data: res } = await api.store.getSummarySales({
      storeName: this.state.storeName,
    });

    if (res && res.sum) {
      this.setState({
        purchaseAmount: res.sum["purchaseAmount"],
        salesAmount: res.sum["salesAmount"],
        shipAmount: res.sum["shipAmount"],
      });

      this.purchaseAmount = res.sum["purchaseAmount"];
      this.salesAmount = res.sum["salesAmount"];
      this.shipAmount = res.sum["shipAmount"];
    }
  };

  public onEraseDatePicker = (type: number) => {
    let data = this.state.modalRow;
    if (type == 1) data["取引日"] = null;
    else if (type == 2) data["卸日"] = null;
    else if (type == 3) data["入金日"] = null;
    this.setState({ modalRow: { ...data } });
  };

  public onEraseTimePicker = () => {
    let data = this.state.modalRow;
    data["時刻"] = null;
    this.setState({ modalRow: data });
  };

  public onGetData = async () => {
    // loading params
    const params = {
      dataName: "sales",
      pointertrack: this.pointer,
      count: this.PAGE_SIZE,
      storeName: this.state.storeName,
    };
    // loading params end
    const res = await api.store.getPointerSales(params);
    if (res.data.lastIndex != 1) {
      this.setState({
        lastIndex: res.data.lastIndex + 1,
        total: res.data.total,
      });
      this.total = res.data.total;
    }
    const temp = res.data.data;
    this.Request_Status = temp.length;

    let changedTypeData: any[] = [];

    temp.forEach((item: any) => {
      item["商品No"] = item["商品no"];
      item["店舗名"] = item["店舗名"] ? item["店舗名"] : "店舗名";
      item["取引日"] = item["取引日"] ? new Date(item["取引日"]) : null;
      item["時刻"] = item["時刻"] ? item["時刻"] : "00:00";
      item["成約/不成約"] = item["成約/不成約"] ? item["成約/不成約"] : "";
      item["担当者"] = item["担当者"] ? item["担当者"] : "";
      item["氏名"] = item["氏名"] ? item["氏名"] : "";
      item["フリガナ"] = item["フリガナ"] ? item["フリガナ"] : "";
      item["年齢"] = item["年齢"] ? item["年齢"] : 0;
      item["性別"] = item["性別"] ? item["性別"] : "";
      item["電話番号"] = item["電話番号"] ? item["電話番号"] : "";
      item["住所"] = item["住所"] ? item["住所"] : "";
      item["来店動機A"] = item["来店動機a"] ? item["来店動機a"] : "";
      item["来店動機B"] = item["来店動機b"] ? item["来店動機b"] : "";
      item["折込エリアorメモ"] = item["折込エリアorメモ"]
        ? item["折込エリアorメモ"]
        : "";
      item["商品種別A"] = item["商品種別a"] ? item["商品種別a"] : "";
      item["商品種別B"] = item["商品種別b"] ? item["商品種別b"] : "";
      item["商品"] = item["商品"] ? item["商品"] : "";
      // item['商品'] = item['商品'] ? item['商品'].replace(/　/g,'・') : ''
      item["ブランド名"] = item["ブランド名"] ? item["ブランド名"] : "";
      item["型番/シリアル"] = item["型番/シリアル"]
        ? item["型番/シリアル"]
        : "";
      item["ランク"] = item["ランク"] ? item["ランク"] : "";
      item["業者名1"] = item["業者名1"] ? item["業者名1"] : "";
      item["業者名2"] = item["業者名2"] ? item["業者名2"] : "";
      item["業者名3"] = item["業者名3"] ? item["業者名3"] : "";
      item["業者名4"] = item["業者名4"] ? item["業者名4"] : "";
      item["業者名5"] = item["業者名5"] ? item["業者名5"] : "";
      item["最高額業者"] = item["最高額業者"] ? item["最高額業者"] : "";
      item["業者最高額"] = item["業者最高額"] ? item["業者最高額"] : 0;
      item["状態"] = item["状態"] ? item["状態"] : "";
      item["数量"] = item["数量"] ? item["数量"] : 0;
      item["金属種別"] = item["金属種別"] ? item["金属種別"] : "";
      item["グラムor額面"] = item["グラムor額面"] ? item["グラムor額面"] : 0;
      item["買取額"] = item["買取額"] ? item["買取額"] : 0;
      item["売上額"] = item["売上額"] ? item["売上額"] : 0;
      item["送料"] = item["送料"] ? item["送料"] : 0;
      item["落札手数料"] = item["落札手数料"] ? item["落札手数料"] : 0;
      item["売上＋送料"] = item["売上額"] + item["送料"];
      item["決済方法"] = item["決済方法"] ? item["決済方法"] : "";
      item["ヤフオク計上月"] = item["ヤフオク計上月"]
        ? new Date(item["ヤフオク計上月"])
        : null;
      item["粗利益"] = item["売上＋送料"] - item["買取額"];
      item["卸日"] = item["卸日"] ? new Date(item["卸日"]) : null;
      item["入金日"] = item["入金日"] ? new Date(item["入金日"]) : null;
      item["卸先"] = item["卸先"] ? item["卸先"] : "";
      item["オークションID"] = item["オークションid"]
        ? item["オークションid"]
        : "";
      item["備考"] = item["備考"] ? item["備考"] : "";
      item["画像"] = item["画像"] ? item["画像"] : [];
      item["入力者"] = item["入力者"] ? item["入力者"] : "";
      // item['操作'] = item['入金日'] ? 0 : 2
      item["操作"] = 0;

      changedTypeData.push(item);
    });

    const temp_storeNames = res.data.storeNames;
    let storeNames = [] as any;
    temp_storeNames.forEach((element: { id: any; 店舗名: any }) => {
      storeNames.push({ value: element.店舗名, key: element.id });
    });
    this.setState({ storeNames: storeNames });

    // getting result show
    if (params.pointertrack == 0) {
      // first data getting
      // this.tempData = changedTypeData;
      this.setState({ data: changedTypeData });
    } else {
      // next data getting
      this.tempData = this.state.data?.concat(changedTypeData);
      this.setState({ data: this.tempData });
    }
    this.setState({ loading: false });
    if (this.Request_Status != 0) this.loadMore();
    // getting result show end
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
          <table className="w-6/12 dailyCheck ml-3">
            <tbody>
              <tr>
                <th>買取額</th>
                <th>売上額</th>
                <th>送料</th>
                <th>売上＋送料</th>
                <th>粗利益</th>
              </tr>
              <tr>
                <td>¥{this.state.purchaseAmount.toLocaleString()}</td>
                <td>¥{this.state.salesAmount.toLocaleString()}</td>
                <td>¥{this.state.shipAmount.toLocaleString()}</td>
                <td>
                  ¥
                  {(
                    this.state.salesAmount + this.state.shipAmount
                  ).toLocaleString()}
                </td>
                <td>
                  ¥
                  {(
                    this.state.salesAmount +
                    this.state.shipAmount -
                    this.state.purchaseAmount
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <Box className="flex flex-row justify-end gird-header">
            <div className="align-middle rounded-tl-lg rounded-tr-lg inline-block w-full px-4 py-4 overflow-hidden !bg-transparent">
              <div className="flex justify-between">
                検索結果 &nbsp;&nbsp;{this.state.total.toLocaleString()} 件
              </div>
            </div>
            <IgrDataGridToolbar ref={this.onToolbarRef} columnChooser="true" />
            <input
              accept=".xlsx"
              id="csv-file"
              type="file"
              style={{ display: "none" }}
              onChange={this.onLoadFile}
            />
            <label htmlFor="csv-file">
              <Button
                component="span"
                sx={{
                  width: 164,
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
              >
                EXCELアップロード
              </Button>
            </label>
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
                event.preventDefault();
                this.onExportExcel("売上表");
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
              editMode={0}
              // summaryScope="none"
              filterUIType="FilterRow"
              columnMovingMode={"none"}
              // headerClickAction={'none'}
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              // selectionMode="MultipleRow"
              notifyOnAllSelectionChanges={true}
              cellValueChanging={this.onCellValueChanging}
              activeCellChanged={this.onActiveCellChange}
              filterExpressionsChanged={this.onFilterExpressionsChanged}
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
              <IgrNumericColumn
                field="商品No"
                pinned="left"
                isEditable={false}
                dataBound={this.onCellDataBound}
                width={"80"}
              />
              <IgrTextColumn
                field="店舗名"
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrDateTimeColumn
                field="取引日"
                dataBound={this.onCellDataBound}
                formatOverride={this.formatter}
                width={"*>110"}
              />
              {/* <IgrTemplateColumn field="時刻" dataBound={this.onCellDataBound} cellUpdating={this.getTimeCellUpdating} /> */}
              <IgrTextColumn
                field="時刻"
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrComboBoxColumn
                field="成約/不成約"
                dataSource={contracts}
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrTextColumn
                field="担当者"
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrTextColumn
                field="氏名"
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrTextColumn
                field="フリガナ"
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrNumericColumn
                field="年齢"
                positiveSuffix="歳"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              <IgrComboBoxColumn
                field="性別"
                dataSource={gender}
                dataBound={this.onCellDataBound}
                width={"*>80"}
              />
              <IgrTextColumn
                field="電話番号"
                dataBound={this.onCellDataBound}
              />
              <IgrTextColumn field="住所" dataBound={this.onCellDataBound} />
              <IgrComboBoxColumn
                field="来店動機A"
                dataSource={this.reasonA_api}
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrComboBoxColumn
                field="来店動機B"
                dataSource={this.reasonB_api}
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              {/* Empty Column from CSV */}
              {/* <IgrTextColumn field="折込エリアorメモ" dataBound={this.onCellDataBound} /> */}
              {/* --------------------- */}
              <IgrComboBoxColumn
                field="商品種別A"
                dataSource={this.productA_api}
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              {/* <IgrComboBoxColumn field="商品種別B" dataSource={this.productB_api} dataBound={this.onCellDataBound} width={'*>110'} /> */}
              <IgrTextColumn field="商品" dataBound={this.onCellDataBound} />
              {/* Empty Column from CSV */}
              {/* <IgrComboBoxColumn field="ブランド名" dataSource={this.brands_api} dataBound={this.onCellDataBound} /> */}
              {/* <IgrTextColumn field="型番/シリアル" dataBound={this.onCellDataBound} /> */}
              {/* <IgrComboBoxColumn field="ランク" dataSource={this.ranks_api} dataBound={this.onCellDataBound} width={'*>110'} /> */}
              {/* <IgrTextColumn field="業者名1" dataBound={this.onCellDataBound} /> */}
              {/* <IgrTextColumn field="業者名2" dataBound={this.onCellDataBound} /> */}
              {/* <IgrTextColumn field="業者名3" dataBound={this.onCellDataBound} /> */}
              {/* <IgrTextColumn field="業者名4" dataBound={this.onCellDataBound} /> */}
              {/* <IgrTextColumn field="業者名5" dataBound={this.onCellDataBound} /> */}
              <IgrTextColumn
                field="最高額業者"
                dataBound={this.onCellDataBound}
              />
              {/* <IgrNumericColumn field="業者最高額" positivePrefix="¥" dataBound={this.onCellDataBound} showGroupingSeparator="true" /> */}
              <IgrTextColumn
                field="状態"
                dataBound={this.onCellDataBound}
                width={"*>80"}
              />
              {/* --------------------- */}
              <IgrNumericColumn
                field="数量"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              <IgrComboBoxColumn
                field="金属種別"
                dataSource={metals}
                dataBound={this.onCellDataBound}
                width={"*>80"}
              />
              <IgrNumericColumn
                field="グラムor額面"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              <IgrNumericColumn
                field="買取額"
                positivePrefix="¥"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              <IgrNumericColumn
                field="売上額"
                positivePrefix="¥"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              <IgrNumericColumn
                field="送料"
                positivePrefix="¥"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              {/* Empty Column from CSV */}
              <IgrNumericColumn
                field="落札手数料"
                positivePrefix="¥"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              {/* --------------------- */}
              <IgrNumericColumn
                field="売上＋送料"
                isEditable={false}
                positivePrefix="¥"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>80"}
              />
              <IgrComboBoxColumn
                field="決済方法"
                dataSource={payments}
                dataBound={this.onCellDataBound}
                width={"*>110"}
              />
              <IgrDateTimeColumn
                field="ヤフオク計上月"
                dateTimeFormat={0}
                dataBound={this.onCellDataBound}
                formatOverride={this.formatter}
                width={"*>110"}
              />
              <IgrNumericColumn
                field="粗利益"
                isEditable={false}
                positivePrefix="¥"
                dataBound={this.onCellDataBound}
                showGroupingSeparator="true"
                width={"*>110"}
              />
              <IgrDateTimeColumn
                field="卸日"
                dateTimeFormat={0}
                dataBound={this.onCellDataBound}
                formatOverride={this.formatter}
                width={"*>110"}
              />
              <IgrDateTimeColumn
                field="入金日"
                dateTimeFormat={0}
                dataBound={this.onCellDataBound}
                formatOverride={this.formatter}
                width={"*>110"}
              />
              <IgrComboBoxColumn
                field="卸先"
                dataSource={sales}
                dataBound={this.onCellDataBound}
              />
              <IgrTextColumn
                field="オークションID"
                dataBound={this.onCellDataBound}
              />
              <IgrTextColumn field="備考" dataBound={this.onCellDataBound} />
              {/* Empty Column from CSV */}
              {/* <IgrTemplateColumn field="画像" cellUpdating={this.onImageCellUpdating} width={`*>${this.imgColumnWidth}`} dataBound={this.onCellDataBound} /> */}
              {/* --------------------- */}
              <IgrTextColumn field="入力者" dataBound={this.onCellDataBound} />
              {/* Auto Column */}
              <IgrTemplateColumn
                field="操作"
                width={"*>150"}
                pinned="right"
                cellUpdating={this.onActionCellUpdating}
                dataBound={this.onCellDataBound}
              />
              {/* --------------------- */}
            </IgrDataGrid>

            {/* Bottom Button */}
            <div
              className={`flex ${
                !this.state.addRowHidden && "hidden"
              } absolute overflow-x-auto overflow-y-hidden w-full bottom-11`}
              onScroll={this.handleScroll}
              onClick={this.handlClick}
            >
              <div className="flex addRow-input min-w-[80px] p-[10px]">
                {this.state.addRowData["商品No"]}
              </div>
              <div className="flex addRow-input min-w-[110px] p-[10px]">
                {this.state.storeName}
              </div>
              <div className="flex addRow-input min-w-[110px] 取引日">
                <DatePickerValue
                  date={this.state.addRowData["取引日"]}
                  onChange={(value: any) =>
                    this.onChangedAddRow("取引日", value)
                  }
                />
              </div>
              <div className="flex addRow-input min-w-[110px] 時刻">
                <TimePickerValue
                  time={this.state.addRowData["時刻"]}
                  onChange={(value: any) => this.onChangedAddRow("時刻", value)}
                />
              </div>
              <div className="flex addRow-input !w-[110px] 成約/不成約">
                <Select
                  className="w-6/12 my-auto h-[34px] w-[150px]"
                  value={
                    this.state.addRowData["成約/不成約"]
                      ? this.state.addRowData["成約/不成約"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("成約/不成約", event.target.value)
                  }
                >
                  {contracts.map((item: any, key: number) => {
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
                className="addRow-input min-w-[110px]"
                placeholder="担当者"
                value={this.state.addRowData["担当者"]}
                onChange={(event) =>
                  this.onChangedAddRow("担当者", event.target.value)
                }
              />
              <input
                className="addRow-input min-w-[110px]"
                placeholder="氏名"
                value={this.state.addRowData["氏名"]}
                onChange={(event) =>
                  this.onChangedAddRow("氏名", event.target.value)
                }
              />
              <input
                className="addRow-input min-w-[110px]"
                placeholder="フリガナ"
                value={this.state.addRowData["フリガナ"]}
                onChange={(event) =>
                  this.onChangedAddRow("フリガナ", event.target.value)
                }
              />
              <input
                className="addRow-input  !w-[80px]"
                placeholder="年齢"
                type="number"
                value={this.state.addRowData["年齢"]}
                onChange={(event) =>
                  this.onChangedAddRow("年齢", event.target.value)
                }
              />
              <div className="flex addRow-input  !w-[80px]">
                <Select
                  className="w-6/12 my-auto h-[34px]  !w-[80px]"
                  value={
                    this.state.addRowData["性別"]
                      ? this.state.addRowData["性別"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("性別", event.target.value)
                  }
                >
                  {gender.map((item: any, key: number) => {
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
                className="addRow-input"
                placeholder="電話番号"
                value={this.state.addRowData["電話番号"]}
                onChange={(event) =>
                  this.onChangedAddRow("電話番号", event.target.value)
                }
              />
              <input
                className="addRow-input"
                placeholder="住所"
                value={this.state.addRowData["住所"]}
                onChange={(event) =>
                  this.onChangedAddRow("住所", event.target.value)
                }
              />
              <div className="flex addRow-input min-w-[110px]">
                <Select
                  className="w-6/12 my-auto h-[34px] w-[110px]"
                  value={
                    this.state.addRowData["来店動機A"]
                      ? this.state.addRowData["来店動機A"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("来店動機A", event.target.value)
                  }
                >
                  {this.reasonA_api.map((item: any, key: number) => {
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
              <div className="flex addRow-input min-w-[110px]">
                <Select
                  className="w-6/12 my-auto h-[34px] w-[110px]"
                  value={
                    this.state.addRowData["来店動機B"]
                      ? this.state.addRowData["来店動機B"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("来店動機B", event.target.value)
                  }
                >
                  {this.reasonB_api.map((item: any, key: number) => {
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
              {/* <input className="addRow-input" placeholder="折込エリアorメモ" value={this.state.addRowData['折込エリアorメモ']} onChange={(event) => this.onChangedAddRow('折込エリアorメモ', event.target.value)} /> */}
              <div className="flex addRow-input min-w-[110px]">
                <Select
                  className="w-6/12 my-auto h-[34px] w-[110px]"
                  value={
                    this.state.addRowData["商品種別A"]
                      ? this.state.addRowData["商品種別A"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("商品種別A", event.target.value)
                  }
                >
                  {this.productA_api.map((item: any, key: number) => {
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
              {/* <div className="flex addRow-input min-w-[110px]">
                <Select className="w-6/12 my-auto h-[34px] w-[110px]" value={(this.state.addRowData['商品種別B']) ? this.state.addRowData['商品種別B'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('商品種別B', event.target.value)}>
                  {
                    this.productB_api.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div> */}
              <input
                className="addRow-input"
                placeholder="商品"
                value={this.state.addRowData["商品"]}
                onChange={(event) =>
                  this.onChangedAddRow("商品", event.target.value)
                }
              />
              {/* <div className="flex addRow-input min-w-[150px]">
                <Select className="w-6/12 my-auto h-[34px] w-[150px]" value={(this.state.addRowData['ブランド名']) ? this.state.addRowData['ブランド名'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('ブランド名', event.target.value)}>
                  {
                    this.brands_api.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div> */}
              {/* <input className="addRow-input" placeholder="型番/シリアル" value={this.state.addRowData['型番/シリアル']} onChange={(event) => this.onChangedAddRow('型番/シリアル', event.target.value)} /> */}
              {/* <div className="flex addRow-input min-w-[110px] ランク">
                <Select className="w-6/12 my-auto h-[34px] w-[110px]" value={(this.state.addRowData['ランク']) ? this.state.addRowData['ランク'] : ""} sx={{
                  "fieldset": {
                    border: 'none',
                  }
                }}
                  onChange={(event) => this.onChangedAddRow('ランク', event.target.value)}>
                  {
                    this.ranks_api.map((item: any, key: number) => {
                      return (
                        <MenuItem key={item.value + key} value={item.value} onClick={(e) => { e.preventDefault() }}>
                          {item.value}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </div> */}
              {/* <input className="addRow-input" placeholder="業者名1" value={this.state.addRowData['業者名1']} onChange={(event) => this.onChangedAddRow('業者名1', event.target.value)} /> */}
              {/* <input className="addRow-input" placeholder="業者名2" value={this.state.addRowData['業者名2']} onChange={(event) => this.onChangedAddRow('業者名2', event.target.value)} /> */}
              {/* <input className="addRow-input" placeholder="業者名3" value={this.state.addRowData['業者名3']} onChange={(event) => this.onChangedAddRow('業者名3', event.target.value)} /> */}
              {/* <input className="addRow-input" placeholder="業者名4" value={this.state.addRowData['業者名4']} onChange={(event) => this.onChangedAddRow('業者名4', event.target.value)} /> */}
              {/* <input className="addRow-input" placeholder="業者名5" value={this.state.addRowData['業者名5']} onChange={(event) => this.onChangedAddRow('業者名5', event.target.value)} /> */}
              <input
                className="addRow-input"
                placeholder="最高額業者"
                value={this.state.addRowData["最高額業者"]}
                onChange={(event) =>
                  this.onChangedAddRow("最高額業者", event.target.value)
                }
              />
              {/* <input className="addRow-input" placeholder="業者最高額" type="number" value={this.state.addRowData['業者最高額']} onChange={(event) => this.onChangedAddRow('業者最高額', event.target.value)} /> */}
              <input
                className="addRow-input !w-[80px]"
                placeholder="状態"
                value={this.state.addRowData["状態"]}
                onChange={(event) =>
                  this.onChangedAddRow("状態", event.target.value)
                }
              />
              <input
                className="addRow-input !w-[80px]"
                placeholder="数量"
                type="number"
                value={this.state.addRowData["数量"]}
                onChange={(event) =>
                  this.onChangedAddRow("数量", event.target.value)
                }
              />
              <div className="flex addRow-input !w-[80px]">
                <Select
                  className="w-6/12 my-auto h-[34px] !w-[80px]"
                  value={
                    this.state.addRowData["金属種別"]
                      ? this.state.addRowData["金属種別"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("金属種別", event.target.value)
                  }
                >
                  {metals.map((item: any, key: number) => {
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
                className="addRow-input !w-[80px]"
                placeholder="グラムor額面"
                type="number"
                value={this.state.addRowData["グラムor額面"]}
                onChange={(event) =>
                  this.onChangedAddRow("グラムor額面", event.target.value)
                }
              />
              <input
                className="addRow-input !w-[80px]"
                placeholder="買取額"
                type="number"
                value={this.state.addRowData["買取額"]}
                onChange={(event) =>
                  this.onChangedAddRow("買取額", event.target.value)
                }
              />
              <input
                className="addRow-input !w-[80px]"
                placeholder="売上額"
                type="number"
                value={this.state.addRowData["売上額"]}
                onChange={(event) =>
                  this.onChangedAddRow("売上額", event.target.value)
                }
              />
              <input
                className="addRow-input !w-[80px]"
                placeholder="送料"
                type="number"
                value={this.state.addRowData["送料"]}
                onChange={(event) =>
                  this.onChangedAddRow("送料", event.target.value)
                }
              />
              <input
                className="addRow-input !w-[80px]"
                placeholder="落札手数料"
                type="number"
                value={this.state.addRowData["落札手数料"]}
                onChange={(event) =>
                  this.onChangedAddRow("落札手数料", event.target.value)
                }
              />
              <input
                className="addRow-input !w-[80px]"
                placeholder="売上＋送料"
                type="number"
                value={this.state.addRowData["売上＋送料"]}
                onChange={(event) =>
                  this.onChangedAddRow("売上＋送料", event.target.value)
                }
              />
              <div className="flex addRow-input min-w-[110px] 決済方法">
                <Select
                  className="w-6/12 my-auto h-[34px] w-[110px]"
                  value={
                    this.state.addRowData["決済方法"]
                      ? this.state.addRowData["決済方法"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("決済方法", event.target.value)
                  }
                >
                  {payments.map((item: any, key: number) => {
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
              <div className="flex addRow-input min-w-[110px] ヤフオク計上月">
                <DatePickerValue
                  date={this.state.addRowData["ヤフオク計上月"]}
                  onChange={(value: any) =>
                    this.onChangedAddRow("ヤフオク計上月", value)
                  }
                />
              </div>
              <input
                className="addRow-input min-w-[110px]"
                placeholder="粗利益"
                type="number"
                value={this.state.addRowData["粗利益"]}
                onChange={(event) =>
                  this.onChangedAddRow("粗利益", event.target.value)
                }
              />
              <div className="flex addRow-input min-w-[110px] 卸日">
                <DatePickerValue
                  date={this.state.addRowData["卸日"]}
                  onChange={(value: any) => this.onChangedAddRow("卸日", value)}
                />
              </div>
              <div className="flex addRow-input min-w-[110px] 入金日">
                <DatePickerValue
                  date={this.state.addRowData["入金日"]}
                  onChange={(value: any) =>
                    this.onChangedAddRow("入金日", value)
                  }
                />
              </div>
              <div className="flex addRow-input min-w-[150px] 卸先">
                <Select
                  className="w-6/12 my-auto h-[34px] w-[150px]"
                  value={
                    this.state.addRowData["卸先"]
                      ? this.state.addRowData["卸先"]
                      : ""
                  }
                  sx={{
                    fieldset: {
                      border: "none",
                    },
                  }}
                  onChange={(event) =>
                    this.onChangedAddRow("卸先", event.target.value)
                  }
                >
                  {sales.map((item: any, key: number) => {
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
                className="addRow-input"
                placeholder="オークションID"
                value={this.state.addRowData["オークションID"]}
                onChange={(event) =>
                  this.onChangedAddRow("オークションID", event.target.value)
                }
              />
              <input
                className="addRow-input"
                placeholder="備考"
                value={this.state.addRowData["備考"]}
                onChange={(event) =>
                  this.onChangedAddRow("備考", event.target.value)
                }
              />
              {/* <div className="flex items-center justify-between addRow-input min-w-[200px] 画像">
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


              </div> */}
              <input
                className="addRow-input"
                placeholder="入力者"
                value={this.state.addRowData["入力者"]}
                disabled
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
          open={this.state.openRemoveModal}
          style={{
            position: "absolute",
            margin: "auto",
            height: 476,
            width: 525,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[10px]">
            <div className="flex w-full h-[40px] px-[40px] bg-primary rounded-t-[10px]">
              <h1 className="font-Meiryo text-white text-[20px] my-auto font-bold">
                画像削除
              </h1>
            </div>
            <div className="h-[350px] w-full px-16 overflow-y-auto m-auto">
              {this.state.images &&
                this.state.images?.map((image: any, key: any) => {
                  return (
                    <div
                      className="flex justify-between w-full mx-auto my-3"
                      key={"画像削除" + key}
                    >
                      <div className="flex">
                        <div className="file-image">
                          <img
                            src={`${this.IMAGE_PATH}${
                              this.state.isAddRow ? "temp/" : ""
                            }${image}`}
                            alt=""
                            width={32}
                            height={32}
                          />
                        </div>
                        <h5 className="my-auto">{`${image}`}</h5>
                      </div>
                      <img
                        className="cursor-pointer"
                        src="assets/icons/Close.svg"
                        onClick={(e) => {
                          e.preventDefault();
                          let images = this.state.images;
                          images = images.filter((e: any) => e !== image);
                          this.setState({ images: images });
                        }}
                      />
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-center my-auto">
              <button
                className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-gray items-center"
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({ openRemoveModal: false });
                }}
              >
                キャンセル
              </button>
              <button
                className="flex h-[34px] rounded-[4px] px-[14px] py-[9px] text-[14px] text-white bg-primary mx-1 items-center"
                onClick={(e) => {
                  e.preventDefault();
                  this.onRemoveImages();
                }}
              >
                保 存
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          open={this.state.openViewModal}
          style={{
            position: "absolute",
            margin: "auto",
            height: 546,
            width: 700,
          }}
          onClose={() => {
            this.setState({ isAddRow: false });
            this.setState({ openViewModal: false });
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-[10px]">
            <div className="flex justify-between m-auto items-center">
              <img
                className="mx-3 cursor-pointer"
                src="assets/icons/Left.svg"
                width={18}
                height={32}
                onClick={(e) => {
                  e.preventDefault();
                  this.prevImageView();
                }}
              />
              <div className="flex flex-col">
                <img
                  src={`${this.state.imageURL}`}
                  className="w-[600px] h-[400px]"
                />
                <h5 className="font-Meiryo text-[14px] mt-3 w-full text-left">{`${
                  this.state.imageComment || "フリーコメント"
                }`}</h5>
              </div>
              <img
                className="mx-3 cursor-pointer"
                src="assets/icons/Right.svg"
                width={18}
                height={32}
                onClick={(e) => {
                  e.preventDefault();
                  this.nextImageView();
                }}
              />
            </div>
          </div>
        </Modal>
        <Modal
          className="min-w-[876px]"
          open={this.state.openDetailModal}
          style={{
            position: "absolute",
            width: "50vw",
            margin: "auto",
            height: "90vh",
          }}
          onClose={() => {
            this.setState({ openDetailModal: false });
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full border-none">
            <div className="flex w-full h-[200px] px-[40px] bg-[#BCD8F1] rounded-t-[20px]">
              <h1 className="font-Meiryo text-[20px] my-auto">商品詳細</h1>
            </div>
            <div className="bg-white p-10 overflow-y-auto rounded-b-[20px]">
              <h1 className="font-Meiryo text-[16px] my-auto font-bold mb-10">
                商品情報
              </h1>

              {/* No & Contract */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">商品No</label>
                  <label className="w-6/12 my-auto">
                    {this.state.modalRow?.["商品No"]}
                  </label>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">成約／不成約</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["成約/不成約"]
                        ? this.state.modalRow?.["成約/不成約"]
                        : ""
                    }
                    onChange={(event: any) => {
                      event.preventDefault();
                      let data = this.state.modalRow;
                      data["成約/不成約"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {contracts.map((item: any, key: number) => {
                      return (
                        <MenuItem
                          key={item.value}
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
              </div>

              {/* Date & Time */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">取引日時</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue
                      disabled={!this.show_saveButton}
                      date={this.state.modalRow?.["取引日"]}
                      onChange={(value: any) => {
                        const tempY = value?.$d?.getFullYear();
                        const tempM = value?.$d?.getMonth() + 1;
                        const tempD = value?.$d?.getDate();
                        const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempY + "-" + tempM + "-" + tempD)) {
                          let data = this.state.modalRow;
                          data["取引日"] = new Date(
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
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">時刻</label>
                  <div className="w-6/12 my-auto">
                    <TimePickerValue
                      disabled={!this.show_saveButton}
                      time={this.state.modalRow?.["時刻"]}
                      onChange={(value: any) => {
                        const tempH = value?.$d?.getHours();
                        const tempM = value?.$d?.getMinutes();
                        const regex = /^\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempH + "-" + tempM)) {
                          let data = this.state.modalRow;
                          const jstDateObj = new Date(value.toISOString());
                          data["時刻"] = jstDateObj.toLocaleString("ja-JP", {
                            timeStyle: "short",
                          });
                          this.setState({ modalRow: data });
                        }
                      }}
                    />
                  </div>
                  <IconButton
                    aria-label="cancel"
                    className="!ml-[-10px]"
                    onClick={this.onEraseTimePicker}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
              </div>

              {/* ProductA & ProductB */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">商品種別A</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["商品種別A"]
                        ? this.state.modalRow?.["商品種別A"]
                        : ""
                    }
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["商品種別A"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {this.productA_api.map((item: any, key: number) => {
                      return (
                        <MenuItem
                          value={`${item.value}`}
                          key={`productA-${key}`}
                        >
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">商品種別B</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["商品種別B"]
                        ? this.state.modalRow?.["商品種別B"]
                        : ""
                    }
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["商品種別B"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {this.productB_api.map((item: any, key: number) => {
                      return (
                        <MenuItem
                          value={`${item.value}`}
                          key={`productB-${key}`}
                        >
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              </div>

              {/* Product Name */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">商品</label>
                <TextField
                  className="w-[78%] my-auto"
                  disabled={!this.show_saveButton}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["商品"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["商品"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* Brand & Series */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">ブランド名</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["ブランド名"]
                        ? this.state.modalRow?.["ブランド名"]
                        : ""
                    }
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["ブランド名"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {this.brands_api.map((item: any, key: number) => {
                      return (
                        <MenuItem value={`${item.value}`} key={`brands-${key}`}>
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">型番/シリアル</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["型番/シリアル"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["型番/シリアル"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Rank & Trader1 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">ランク</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["ランク"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["ランク"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">業者名1</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["業者名1"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["業者名1"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Trader2 & Trader3 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">業者名2</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["業者名2"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["業者名2"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">業者名3</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["業者名3"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["業者名3"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Trader4 & Trader5 */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">業者名4</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["業者名4"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["業者名4"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">業者名5</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["業者名5"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["業者名5"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Higher & TraderHigher */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">最高額業者</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["最高額業者"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["最高額業者"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">業者最高額</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["業者最高額"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["業者最高額"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Status & Amount */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">状態</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["状態"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["状態"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">数量</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["数量"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["数量"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Metal & Gram */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">金属種別</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["金属種別"]
                        ? this.state.modalRow?.["金属種別"]
                        : ""
                    }
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["金属種別"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {metals.map((item: any, key: number) => {
                      return (
                        <MenuItem value={`${item.value}`} key={`metals-${key}`}>
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">グラムor額面</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["グラムor額面"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["グラムor額面"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Buy & Sell */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">買取額</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["買取額"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["買取額"] = event.target.value;

                      data["売上＋送料"] =
                        parseFloat(data["売上額"]) + parseFloat(data["送料"]);
                      data["粗利益"] =
                        parseFloat(data["売上＋送料"]) -
                        parseFloat(data["買取額"]);

                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">売上額</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["売上額"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["売上額"] = event.target.value;

                      data["売上＋送料"] =
                        parseFloat(data["売上額"]) + parseFloat(data["送料"]);
                      data["粗利益"] =
                        parseFloat(data["売上＋送料"]) -
                        parseFloat(data["買取額"]);

                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Postage & Auction */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">送料</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["送料"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["送料"] = event.target.value;

                      data["売上＋送料"] =
                        parseFloat(data["売上額"]) + parseFloat(data["送料"]);
                      data["粗利益"] =
                        parseFloat(data["売上＋送料"]) -
                        parseFloat(data["買取額"]);

                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">落札手数料</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["落札手数料"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["落札手数料"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Deliver & Profit */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">売上＋送料</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["売上＋送料"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["売上＋送料"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">粗利益</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["粗利益"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["粗利益"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Wholesale & Incoming Day */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">卸日</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue
                      disabled={!this.show_saveButton}
                      date={this.state.modalRow?.["卸日"]}
                      onChange={(value: any) => {
                        const tempY = value?.$d?.getFullYear();
                        const tempM = value?.$d?.getMonth() + 1;
                        const tempD = value?.$d?.getDate();
                        const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempY + "-" + tempM + "-" + tempD)) {
                          let data = this.state.modalRow;
                          data["卸日"] = new Date(
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
                    onClick={() => this.onEraseDatePicker(2)}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">入金日</label>
                  <div className="w-6/12 my-auto">
                    <DatePickerValue
                      date={this.state.modalRow?.["入金日"]}
                      onChange={(value: any) => {
                        const tempY = value?.$d?.getFullYear();
                        const tempM = value?.$d?.getMonth() + 1;
                        const tempD = value?.$d?.getDate();
                        const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
                        if (regex.test(tempY + "-" + tempM + "-" + tempD)) {
                          let data = this.state.modalRow;
                          data["入金日"] = new Date(
                            value.toLocaleString("ja-JP")
                          );
                          this.setState({ modalRow: data });
                        }
                        if (value == null) {
                          let data = this.state.modalRow;
                          data["入金日"] = null;
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

              {/* Wholesales Price & Auction ID */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">卸先</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["卸先"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["卸先"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">オークションID</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["オークションID"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["オークションID"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">備考</label>
                <TextField
                  className="w-[78%] my-auto"
                  disabled={!this.show_saveButton}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["備考"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["備考"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* Inputer */}
              <div className="flex w-full my-5 pr-5 justify-end">
                <label className="my-auto mr-10">入力者</label>
                <TextField
                  className="w-2/12 my-auto"
                  disabled={!this.show_saveButton}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["入力者"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["入力者"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              <h1 className="font-Meiryo text-black text-[16px] my-auto font-bold mb-10">
                顧客情報
              </h1>

              {/* Name & Hurigana */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">氏名</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["氏名"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["氏名"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">フリガナ</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["フリガナ"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["フリガナ"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">年齢</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["年齢"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["年齢"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">性別</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                      },
                    }}
                    value={this.state.modalRow?.["性別"]}
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["性別"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  />
                </div>
              </div>

              {/* Phone & Address */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">電話番号</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
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
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">住所</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
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
              </div>

              {/* Post number */}
              <div className="flex w-full my-5">
                <div className="flex w-6/12 pr-5">
                  <label className="w-6/12 my-auto pl-10">郵便番号</label>
                  <TextField
                    className="w-6/12 my-auto"
                    disabled={!this.show_saveButton}
                    type="number"
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
                {/* <span className="flex flex-col text-white text-[14px] w-[124px] h-[34px] my-auto mr-5 bg-[#0066FF] hover:bg-[#24BFF2] rounded-full justify-center text-center font-Meiryo cursor-pointer"
                  onClick={() => {
                    alert();
                  }}>
                  郵便番号検索
                </span> */}
              </div>

              {/* ReasonA & ReasonB */}
              <div className="flex w-full my-5">
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">来店動機A</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["来店動機A"]
                        ? this.state.modalRow?.["来店動機A"]
                        : ""
                    }
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["来店動機A"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {this.reasonA_api.map((item: any, key: any) => {
                      return (
                        <MenuItem
                          value={`${item.value}`}
                          key={`reasonA-${key}`}
                        >
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div className="flex w-full pr-5">
                  <label className="w-6/12 my-auto pl-10">来店動機B</label>
                  <Select
                    className="w-6/12 my-auto h-[34px]"
                    disabled={!this.show_saveButton}
                    value={
                      this.state.modalRow?.["来店動機B"]
                        ? this.state.modalRow?.["来店動機B"]
                        : ""
                    }
                    onChange={(event: any) => {
                      let data = this.state.modalRow;
                      data["来店動機B"] = event.target.value;
                      this.setState({ modalRow: data });
                    }}
                  >
                    {this.reasonB_api.map((item: any, key: any) => {
                      return (
                        <MenuItem
                          value={`${item.value}`}
                          key={`reasonB-${key}`}
                        >
                          {item.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              </div>

              {/* Image & Context */}

              <div className="flex w-full my-5">
                <div className="flex flex-row w-full pr-5">
                  <label className="w-3/12 pl-10">画像</label>
                  <div className="flex flex-col w-9/12">
                    <div className="max-h-[200px] overflow-y-auto">
                      {/* image */}
                      {this.state.modalRow?.["画像"].map(
                        (image: any, key: number) => {
                          let img =
                            typeof image == "string" ? image.slice(19, 58) : "";
                          return (
                            <div
                              className="flex justify-between w-full mx-auto my-3"
                              key={`images-${key}`}
                            >
                              <div className="flex w-4/12">
                                <div className="file-image">
                                  <img
                                    src={`${this.IMAGE_PATH}${image}`}
                                    alt=""
                                  />
                                </div>
                                <h5 className="my-auto">{`${img}`}</h5>
                              </div>
                              <TextField
                                className="w-8/12 my-auto"
                                disabled={!this.show_saveButton}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: 34,
                                  },
                                }}
                                placeholder="画像フリーコメント"
                                value={
                                  this.state.modalRow["画像フリーコメント"][
                                    key
                                  ] || ""
                                }
                                onChange={(event: any) => {
                                  let modalRow = this.state.modalRow;
                                  modalRow["画像フリーコメント"][key] =
                                    event.target.value;
                                  this.setState({ modalRow: modalRow });
                                }}
                              />
                              {this.state.modalRow?.操作 == 2 && (
                                <img
                                  className="cursor-pointer"
                                  src="assets/icons/Close.svg"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    let modalRow = this.state.modalRow;
                                    modalRow["画像"].splice(key, 1);
                                    modalRow["画像フリーコメント"].splice(
                                      key,
                                      1
                                    );
                                    this.setState({ modalRow: modalRow });
                                  }}
                                />
                              )}
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
                              <div className="flex w-4/12">
                                <div className="file-image">
                                  <img
                                    src={`${this.IMAGE_PATH}temp/${image}`}
                                    alt=""
                                  />
                                </div>
                                <h5 className="my-auto">{`${img}`}</h5>
                              </div>
                              <TextField
                                className="w-8/12 my-auto"
                                disabled={!this.show_saveButton}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    height: 34,
                                  },
                                }}
                                placeholder="画像フリーコメント  "
                                value={this.state.modalComments[key] || ""}
                                onChange={(event: any) => {
                                  let modalComments = this.state.modalComments;
                                  modalComments[key] = event.target.value;
                                  this.setState({
                                    modalComments: modalComments,
                                  });
                                }}
                              />
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
                    {/* {this.state.modalRow?.操作 == 2 && */}
                    {this.show_saveButton && (
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
                    )}
                  </div>
                </div>
                {/* <div className="flex w-full pr-5">
                  <label className="w-3/12 pl-5">画像フリーコメント</label>
                  <TextField className="w-9/12 ml-2 font-Meiryo" multiline rows={3}
                    value={this.state.modalRow?.['画像フリーコメント']}
                    onChange={(event: any) => {
                      let data = this.state.modalRow
                      data['画像フリーコメント'] = event.target.value
                      this.setState({ modalRow: data })
                    }} />
                </div> */}
              </div>

              {/* Memo */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">
                  折込エリアorメモ{" "}
                </label>
                <TextField
                  className="w-[78%] my-auto"
                  multiline
                  rows={2}
                  disabled={!this.show_saveButton}
                  value={this.state.modalRow?.["折込エリアorメモ"]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["折込エリアorメモ"] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* Email */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">メールアドレス </label>
                <TextField
                  className="w-[78%] my-auto"
                  disabled={!this.show_saveButton}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 34,
                    },
                  }}
                  value={this.state.modalRow?.["メールアドレス "]}
                  onChange={(event: any) => {
                    let data = this.state.modalRow;
                    data["メールアドレス "] = event.target.value;
                    this.setState({ modalRow: data });
                  }}
                />
              </div>

              {/* History */}
              <div className="flex w-full my-5 pr-5">
                <label className="w-3/12 my-auto pl-10">変更履歴 </label>
                <div className="w-9/12 border-solid border-[0.6px] border-[#c4c4c4] rounded-[5px] overflow-y-auto p-3 h-[150px]">
                  {this.state.historyData?.map(
                    (element: any, keyid: number) => {
                      return (
                        <div key={keyid}>
                          {element.updatedAt} : {element.updatedByUsername}
                          <br />
                          {element.field} :{" "}
                          {element.oldValue == "1/1/1970"
                            ? "空"
                            : element.oldValue}{" "}
                          &rarr;{" "}
                          {element.newValue == "1/1/1970"
                            ? "空"
                            : element.newValue}
                          <br />
                          <hr />
                          <br />
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="flex justify-center mx-auto w-full">
                <button
                  className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] text-[14px] text-white bg-gray"
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

                    if (old_modal_data["取引日"] == "") {
                      old_modal_data["取引日"] = null;
                    } else {
                      old_modal_data["取引日"] = new Date(
                        old_modal_data["取引日"]
                      );
                    }

                    if (old_modal_data["ヤフオク計上月"] == "") {
                      old_modal_data["ヤフオク計上月"] = null;
                    } else {
                      old_modal_data["ヤフオク計上月"] = new Date(
                        old_modal_data["ヤフオク計上月"]
                      );
                    }

                    if (old_modal_data["入金日"] == "") {
                      old_modal_data["入金日"] = null;
                    } else {
                      old_modal_data["入金日"] = new Date(
                        old_modal_data["入金日"]
                      );
                    }

                    if (old_modal_data["卸日"] == "") {
                      old_modal_data["卸日"] = null;
                    } else {
                      old_modal_data["卸日"] = new Date(old_modal_data["卸日"]);
                    }

                    let data = this.state.data;
                    data[index] = old_modal_data;

                    this.grid.notifyInsertItem(index, old_modal_data);
                  }}
                >
                  キャンセル
                </button>
                {/* {this.show_saveButton ?
                  // (this.state.modalRow?.操作 == 2 ? */}
                <button
                  className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] text-[14px] text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault();
                    this.onSaveDetailModal();
                  }}
                >
                  保 存
                </button>
                {/* // :
                  // <button className="flex justify-center items-center w-[113px] h-[34px] rounded-[17px] text-[14px] text-white bg-primary mx-1 disabled:bg-gray-200 disabled:opacity-50"
                  //   onClick={(e) => {
                  //     e.preventDefault()
                  //     this.onSaveDetailModal()
                  //   }} disabled>保  存</button>) 
                  : ""
                } */}
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
                  className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ openDeleteModal: false });
                  }}
                >
                  いいえ
                </button>
                <button
                  className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-primary mx-1"
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
        <Modal
          open={this.state.openChooseStoreModal}
          style={{
            position: "absolute",
            top: 150,
            marginInline: "auto",
            height: 194,
            width: 300,
          }}
          disableEnforceFocus
        >
          <div className="flex flex-col w-full h-full bg-white rounded-t-[10px]">
            <div className="flex w-full h-[40px] px-[30px] bg-[#BCD8F1] rounded-t-[10px]">
              <h1 className="font-Meiryo text-[14px] my-auto">
                店舗名を入力してください。
              </h1>
            </div>
            <div className="flex flex-col m-auto">
              <Select
                className="w-6/12 my-auto h-[34px] !w-[100%] border !mb-5"
                value={this.state.choosedStoreName}
                sx={{
                  fieldset: {
                    border: "none",
                  },
                }}
                onChange={(event) =>
                  this.setState({ choosedStoreName: event.target.value })
                }
              >
                {this.state.storeNames.map((item: any, key: any) => {
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
              <div className="flex flex-row justify-content">
                <button
                  className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-gray"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ openChooseStoreModal: false });
                  }}
                >
                  いいえ
                </button>
                <button
                  className="flex items-center justify-center w-[90px] h-[30px] rounded-[15px] text-[14px] text-center text-white bg-primary mx-1"
                  onClick={(e) => {
                    e.preventDefault();
                    this.onUploadExcel(e);
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

    // all
    let filterOperand = new IgrFilterOperand();
    let column = this.grid.actualColumns.item(4);
    filterOperand.editorType = EditorType.Text;

    filterOperand.displayName = "成約/不成約";
    filterOperand.iD = "";
    filterOperand.filterRequested = this.onFilter_all;
    column.filterOperands.add(filterOperand);
    // 成約
    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "成約";
    filterOperand.iD = "成約";
    filterOperand.filterRequested = this.onFilter_success;
    column.filterOperands.add(filterOperand);
    // 不成約
    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "不成約";
    filterOperand.iD = "不成約";
    filterOperand.filterRequested = this.onFilter_failure;
    column.filterOperands.add(filterOperand);

    column = this.grid.actualColumns.item(9);

    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "男性/女性";
    filterOperand.iD = "";
    filterOperand.filterRequested = this.onFilter_sex_all;
    column.filterOperands.add(filterOperand);

    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "男性";
    filterOperand.iD = "男性";
    filterOperand.filterRequested = this.onFilter_male;
    column.filterOperands.add(filterOperand);

    filterOperand = new IgrFilterOperand();
    filterOperand.displayName = "女性";
    filterOperand.iD = "女性";
    filterOperand.filterRequested = this.onFilter_female;
    column.filterOperands.add(filterOperand);
  };

  public onFilter_all = (
    s: IgrFilterOperand,
    args: IgrGridCustomFilterRequestedEventArgs
  ) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isNotEqualTo(".");
  };

  public onFilter_success = (
    s: IgrFilterOperand,
    args: IgrGridCustomFilterRequestedEventArgs
  ) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isEqualTo("成約");
  };

  public onFilter_failure = (
    s: IgrFilterOperand,
    args: IgrGridCustomFilterRequestedEventArgs
  ) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isEqualTo("不成約");
  };

  public onFilter_male = (
    s: IgrFilterOperand,
    args: IgrGridCustomFilterRequestedEventArgs
  ) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isEqualTo("男性");
  };

  public onFilter_sex_all = (
    s: IgrFilterOperand,
    args: IgrGridCustomFilterRequestedEventArgs
  ) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isNotEqualTo("....");
  };

  public onFilter_female = (
    s: IgrFilterOperand,
    args: IgrGridCustomFilterRequestedEventArgs
  ) => {
    let prop = args.filterFactory.property(args.column.field);
    //Filter-in only records with France
    args.expression = prop.isEqualTo("女性");
  };

  public onToolbarRef = (toolbar: IgrDataGridToolbar) => {
    this.toolbar = toolbar;
    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }
  };

  public onActiveCellChange(
    s: IgrDataGrid,
    e: IgrGridActiveCellChangedEventArgs
  ) {
    if (s.activeCell !== null) {
      let rowIndex = s.activeCell.rowIndex;
      let dataItem = s.actualDataSource.getItemAtIndex(rowIndex);
      let columnKey = e.newActiveCell.columnUniqueKey;

      const current_date = new Date();
      const register_date = new Date(dataItem["取引日"]);
      if (register_date > current_date || register_date == null) {
        s.editMode = 1;
      } else {
        s.editMode = 0;
      }

      if (columnKey == "入金日") {
        s.editMode = 1;
      } else if (dataItem["入金日"]) {
        s.editMode = 0;
      } else {
        s.editMode = 1;
      }

      if (s.editMode == 1) {
        if (columnKey == "入金日" && !dataItem["入金日"]) {
          dataItem["入金日"] = new Date();
        }
        if (columnKey == "取引日" && !dataItem["取引日"]) {
          dataItem["取引日"] = new Date();
        }
        if (columnKey == "卸日" && !dataItem["卸日"]) {
          dataItem["卸日"] = new Date();
        }
      }
    }
  }

  /**
   * onRowHeightChange
   */
  public onFilterExpressionsChanged = (
    s: IgrDataGrid,
    e: IgrGridFilterExpressionsEventArgs
  ) => {
    const columnLength = s.combinedColumns.length;
    const dataSource = s.props.dataSource; // object array

    //how to get filter column
    let filterColumn: any = [];
    for (let i = 0; i < columnLength; i++) {
      const fieldName = s.combinedColumns[i].field;
      const isFilterName: any = s.combinedColumns[i].filter;
      // const filterValue
      if (isFilterName != null) {
        if (isFilterName.l)
          filterColumn.push({
            name: fieldName,
            value: isFilterName.l,
            type: isFilterName.f,
          });
        else {
          filterColumn.push({
            name: fieldName,
            value: isFilterName._id,
            type: 0,
          });
        }
      }
    }
    let _totalCount = 0;
    let _purchaseAmount = 0;
    let _salesAmount = 0;
    let _shipAmount = 0;

    dataSource.forEach((dS: any) => {
      let return_key = false;
      filterColumn.forEach((e: any, index: number) => {
        if (e.value != "") {
          switch (e.type) {
            case 0:
              if (dS[`${e.name}`] != e.value) return_key = true;
              break;

            case 1:
              if (dS[`${e.name}`] == e.value) return_key = true;
              break;

            case 14:
              if (dS[`${e.name}`].indexOf(e.value) != 0) return_key = true;
              break;

            case 15:
              if (dS[`${e.name}`].indexOf(e.value) == 0) return_key = true;
              break;

            case 16:
              if (!dS[`${e.name}`].endsWith(e.value)) return_key = true;
              break;

            case 17:
              if (dS[`${e.name}`].endsWith(e.value)) return_key = true;
              break;

            case 12:
              if (!dS[`${e.name}`].includes(e.value)) return_key = true;
              break;

            case 13:
              if (dS[`${e.name}`].includes(e.value)) return_key = true;
              break;

            case 40:
              if (dS[`${e.name}`] != null) return_key = true;
              break;

            case 41:
              if (dS[`${e.name}`] == null) return_key = true;
              break;
            // default:
            //   break;
          }
        }

        if (return_key) {
          return;
        }
      });
      if (!return_key) {
        _totalCount++;
        _purchaseAmount += dS["買取額"];
        _salesAmount += dS["売上額"];
        _shipAmount += dS["送料"];
      }
      return_key = false;
    });

    if (filterColumn.length == 0) {
      this.setState({
        purchaseAmount: this.purchaseAmount,
        salesAmount: this.salesAmount,
        shipAmount: this.shipAmount,
        total: this.total,
      });
    } else {
      this.setState({
        purchaseAmount: _purchaseAmount,
        salesAmount: _salesAmount,
        shipAmount: _shipAmount,
        total: _totalCount,
      });
    }
  };

  public onCellDataBound = (s: any, e: IgrDataBindingEventArgs) => {
    if (e.cellInfo.rowItem["入金日"]) {
      e.cellInfo.background = "#BDD7EE";
      return;
    }
    if (e.cellInfo.rowItem["成約/不成約"] == "不成約") {
      e.cellInfo.background = "#F8CBAD";
      return;
    }
    if (e.cellInfo.rowItem["卸日"] && e.cellInfo.rowItem["オークションID"]) {
      e.cellInfo.background = "#FFE699";
      return;
    }
    if (
      e.cellInfo.rowItem["卸日"] &&
      e.cellInfo.rowItem["オークションID"] == ""
    ) {
      e.cellInfo.background = "#D9D9D9";
      return;
    }
    if (
      (e.cellInfo.rowItem["卸日"] == null ||
        e.cellInfo.rowItem["卸日"] == "") &&
      e.cellInfo.rowItem["オークションID"]
    ) {
      e.cellInfo.background = "#C39BFF";
      return;
    }

    e.cellInfo.background = "#FFFFFF";
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
    obj["product_number"] = dataItem["商品No"];
    obj["old_value"] = e.oldValue;
    obj["new_value"] = e.newValue;
    obj["username"] = this.userName;

    this.changedHistoryData.push(obj);

    e.cellInfo.rowItem["操作"] = 1;
  };

  public onActionCellUpdating = (
    s: IgrTemplateColumn,
    e: IgrTemplateCellUpdatingEventArgs
  ) => {
    const content = e.content as HTMLDivElement;
    content.style.display = "flex";
    content.style.padding = "5px";

    let span1: HTMLSpanElement | null = null;
    let span2: HTMLSpanElement | null = null;
    let img: HTMLImageElement | null = null;

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
    } else if (
      e.cellInfo.rowItem["操作"] == 2 ||
      !e.cellInfo.rowItem["入金日"]
    ) {
      //Editable 2
      content.innerHTML = "";
      if (content.childElementCount === 0) {
        span1 = document.createElement("span");
        span1.textContent = "詳細";
        span1.style.color = "#0066FF";
        span1.onclick = (event) => {
          event.preventDefault();
          this.onOpenDetailModal(e.cellInfo.rowItem);
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
          e.preventDefault();
          this.setState({ openDeleteModal: true });
        };

        if (e.cellInfo.rowItem["取引日"] != null) {
          const today = new Date();
          const dt = new Date(e.cellInfo.rowItem["取引日"]);
          if (dt > today) {
            content.appendChild(span2);
          }
        }
      } else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
      }
    } else {
      //nonEditable 0
      content.innerHTML = "";
      if (content.childElementCount === 0) {
        img = document.createElement("img");
        img.src = "/assets/icons/NotEditable.svg";
        content.appendChild(img);

        span1 = document.createElement("span");
        span1.textContent = "詳細";
        // span1.style.color = '#0066FF'
        span1.style.color = "#808080";
        span1.style.margin = "auto";
        span1.style.cursor = "pointer";

        span1.onclick = (event) => {
          event.preventDefault();
          this.onOpenDetailModal(e.cellInfo.rowItem);
        };

        content.appendChild(span1);

        span2 = document.createElement("span");
        span2.textContent = "削除";
        span2.style.color = "#F24024";
        span2.style.margin = "auto";
        span2.style.cursor = "pointer";

        span2.onclick = (e) => {
          e.preventDefault();
          this.setState({ openDeleteModal: true });
        };

        if (e.cellInfo.rowItem["取引日"] != null) {
          const today = new Date();
          const dt = new Date(e.cellInfo.rowItem["取引日"]);
          if (dt > today) {
            content.appendChild(span2);
          }
        }
      } else {
        span1 = content.children[0] as HTMLSpanElement;
        span2 = content.children[0] as HTMLSpanElement;
        img = content.children[0] as HTMLImageElement;
      }
    }
  };

  public onImageCellUpdating = (
    s: IgrTemplateColumn,
    e: IgrTemplateCellUpdatingEventArgs
  ) => {
    const content = e.content as HTMLDivElement;
    content.style.display = "flex";
    content.style.justifyContent = "space-between";

    let editable = false;
    const s_date = e.cellInfo.rowItem["取引日"];
    const w_date = e.cellInfo.rowItem["卸日"];
    const p_date = e.cellInfo.rowItem["入金日"];
    const current_date = new Date();

    if (w_date == null || p_date == null) {
      editable = true;
    } else if (s_date != null) {
      if (current_date.toLocaleDateString() == s_date.toLocaleDateString())
        editable = true;
    }

    let removeBtn: HTMLInputElement | null = null;
    let addBtn: HTMLInputElement | null = null;
    content.innerHTML = "";
    if (content.childElementCount === 0) {
      removeBtn = document.createElement("input");
      removeBtn.value = "-";
      removeBtn.type = "button";

      removeBtn.style.width = "20px";
      removeBtn.style.height = "20px";
      removeBtn.style.verticalAlign = "middle";
      removeBtn.style.borderWidth = "1px";
      removeBtn.style.borderRadius = "5px";
      removeBtn.style.lineHeight = "initial";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.marginTop = "10px";

      removeBtn.onclick = (event) => {
        if (editable) {
          event.preventDefault();
          this.setState({ isAddRow: false });
          this.setState({ openRemoveModal: true });
          this.setState({ images: e.cellInfo.rowItem["画像"] });
        }
      };

      content.appendChild(removeBtn);
    } else {
      removeBtn = content.children[0] as HTMLInputElement;
    }

    let imgContent: HTMLDivElement | null = null;
    imgContent = document.createElement("div");
    imgContent.style.display = "flex";
    imgContent.style.width = "220px";
    imgContent.style.overflowX = "auto";
    imgContent.style.marginTop = "3px";
    // imgContent.style.justifyContent = 'space-between'

    const info = e.cellInfo as IgrTemplateCellInfo;
    const item = info.rowItem;
    const sales = this.grid.actualDataSource.getItemProperty(
      info.rowItem,
      "Sales"
    );
    const images = item["画像"];

    for (let i = 0; i < images.length; i++) {
      let imgTag: HTMLImageElement | null = null;
      imgTag = document.createElement("img");

      if (imgContent.childElementCount === i) {
        imgTag.src = this.IMAGE_PATH + images[i];
        imgTag.style.width = "30px";
        imgTag.style.height = "30px";
        imgTag.style.borderWidth = "1px";
        imgTag.style.borderColor = "#B1B1B1";
        imgTag.style.borderRadius = "5px";
        imgTag.style.cursor = "pointer";
        imgTag.style.marginTop = "0px";
        imgTag.style.marginRight = "10px";

        imgTag.onclick = (e) => {
          e.preventDefault();
          this.setState({ isAddRow: false });
          this.onViewImage(i);
        };

        imgContent.appendChild(imgTag);
      } else {
        imgTag = imgContent.children[i] as HTMLImageElement;
      }
    }

    if (content.childElementCount < 2) {
      content.appendChild(imgContent);
    } else {
      imgContent = content.children[1] as HTMLDivElement;
    }

    if (content.childElementCount < 3) {
      addBtn = document.createElement("input");
      addBtn.value = "+";
      addBtn.type = "button";

      addBtn.style.width = "20px";
      addBtn.style.height = "20px";
      addBtn.style.display = "flex";
      addBtn.style.cursor = "pointer";
      addBtn.style.marginTop = "10px";
      addBtn.style.lineHeight = "20px";
      addBtn.style.borderWidth = "1px";
      addBtn.style.borderRadius = "5px";
      addBtn.style.verticalAlign = "middle";
      addBtn.style.justifyContent = "center";

      addBtn.onclick = (e) => {
        if (editable) {
          e.preventDefault();
          this.setState({ isAddRow: false });
          this.setState({ openAddModal: true });
        }
      };

      content.appendChild(addBtn);
    } else {
      addBtn = content.children[2] as HTMLInputElement;
    }
  };

  // public drawedTimes = [] as any;
  public getTimeCellUpdating = (
    s: IgrTemplateColumn,
    e: IgrTemplateCellUpdatingEventArgs
  ) => {
    let content = e.content as HTMLDivElement;
    let container: HTMLDivElement | null = null;

    const info = e.cellInfo.rowItem;
    content.id = `content-${info["商品No"]}`;
    content.className = `content-${info["商品No"]}`;

    // content.innerHTML = ""
    if (content.childElementCount === 0) {
      ///////////////////////////////////////

      container = document.createElement("div");
      container.id = `container-${info["商品No"]}`;
      container.className = `container-${info["商品No"]}`;

      ReactDOM.render(
        <TimePickerValue
          active={info["操作"]}
          time={info["時刻"]}
          value={this.onChangeTime}
        />,
        container
      );

      content.appendChild(container);
    } else {
      container = content.children[0] as HTMLDivElement;
    }
  };

  public onChangeTime = (time: any) => {
    let data = this.state.data;

    const rowIndex = this.grid.activeCell.rowIndex;

    data[rowIndex]["時刻"] = time;
    data[rowIndex]["操作"] = 1;

    this.setState({ data: data });
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
    // if (e.cellInfo.rowItem['入金日']) {
    //   e.cellInfo.rowItem['操作'] = 0
    // } else {
    //   e.cellInfo.rowItem['操作'] = 2
    // }
    e.cellInfo.rowItem["操作"] = 2;

    //save changed value
    if (e.cellInfo.rowItem["id"]) {
      //update row
      const res = await api.store.updateSale(
        e.cellInfo.rowItem["id"],
        e.cellInfo.rowItem
      );
      //add update history----------------------------------------------------
      let ownHistoryData = [] as any;
      let otherHistoryData = [] as any;
      this.changedHistoryData.forEach((element: any) => {
        if (e.cellInfo.rowItem["商品No"] == element["product_number"]) {
          ownHistoryData.push(element);
        } else {
          otherHistoryData.push(element);
        }
      });

      const res_history = await api.store.updateSaleHistory(
        e.cellInfo.rowItem["id"],
        ownHistoryData
      );

      this.changedHistoryData = otherHistoryData;
      // add update history end ------------------------------------------
    } else {
      const res = await api.store.createSale(e.cellInfo.rowItem);
    }
  };

  //delete selected row
  public onDeleteRow = async () => {
    // Make a copy of data array
    let data = [...this.state.data];

    this.activeRowIndex = this.grid.activeCell.rowIndex;

    const row = data[this.activeRowIndex];
    const res = await api.store.deleteSale(row["id"]);

    // Remove the original row from the array
    data.splice(this.activeRowIndex, 1);

    this.setState({ data: data });
    this.grid.notifyInsertItem(this.activeRowIndex, 1);

    //close modal
    this.setState({ total: this.state.total - 1 });
    this.setState({ openDeleteModal: false });
  };

  //add new row

  public onAddRow = () => {
    const new_data = {
      商品No: this.state.lastIndex,
      店舗名: this.state.storeName,
      取引日: new Date(),
      時刻: "00:00",
      "成約/不成約": "",
      担当者: "",
      氏名: "",
      フリガナ: "",
      年齢: 0,
      性別: "",
      電話番号: "",
      住所: "",
      来店動機A: "",
      来店動機B: "",
      折込エリアorメモ: "",
      商品種別A: "",
      商品種別B: "",
      商品: "",
      ブランド名: "",
      "型番/シリアル": "",
      ランク: "",
      業者名1: "",
      業者名2: "",
      業者名3: "",
      業者名4: "",
      業者名5: "",
      最高額業者: "",
      業者最高額: 0,
      状態: "",
      数量: 0,
      金属種別: "",
      グラムor額面: 0,
      買取額: 0,
      売上額: 0,
      送料: 0,
      落札手数料: 0,
      "売上＋送料": 0,
      決済方法: "",
      ヤフオク計上月: new Date(),
      粗利益: 0,
      卸日: new Date(),
      入金日: new Date(),
      卸先: "",
      オークションID: "",
      備考: "",
      画像: [] as any,
      入力者: this.userName,
      操作: 2,
    };
    this.setState({ addRowData: new_data });
    this.setState({ addRowHidden: true });
    this.grid.scrollTo(0, 100000000);
  };

  public handleScroll = (event: any) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    this.grid.scrollTo(scrollLeft, 100000000);
  };

  public onChangedAddRow = (field: string, value: any) => {
    let data = this.state.addRowData;

    if (
      field == "取引日" ||
      field == "ヤフオク計上月" ||
      field == "卸日" ||
      field == "入金日"
    ) {
      // try {
      //   const isoString = value.toISOString(); // Outputs "2022-01-01T00:00:00.000Z"
      //   const jstDateObj = new Date(isoString);
      //   const jstString = jstDateObj.toLocaleString("ja-JP", { year: 'numeric', month: '2-digit', day: '2-digit' });
      //   data[field] = jstString
      // } catch {
      //   data[field] = value
      // }

      data[field] = new Date(value);
    } else if (field == "時刻") {
      try {
        const isoString = value.toISOString(); // Outputs "2022-01-01T00:00:00.000Z"
        const jstDateObj = new Date(isoString);
        const jstString = jstDateObj.toLocaleString("ja-JP", {
          timeStyle: "short",
        });
        data[field] = jstString;
      } catch {
        data[field] = value;
      }
    } else if (field == "買取額" || field == "売上額" || field == "送料") {
      data[field] = value;
      data["売上＋送料"] =
        parseFloat(data["売上額"]) + parseFloat(data["送料"]);
      data["粗利益"] =
        parseFloat(data["売上＋送料"]) - parseFloat(data["買取額"]);
    } else data[field] = value;

    this.setState({ addRowData: data });
  };

  public onAddRowSave = async () => {
    try {
      const res = await api.store.createSale(this.state.addRowData);
      if (res.status == 201) {
        let data = this.state.data;
        let temp = this.state.addRowData;

        temp["id"] = res.data.id;

        if (temp["取引日"] == "") {
          temp["取引日"] = null;
        } else {
          temp["取引日"] = new Date(temp["取引日"]);
        }

        if (temp["ヤフオク計上月"] == "") {
          temp["ヤフオク計上月"] = null;
        } else {
          temp["ヤフオク計上月"] = new Date(temp["ヤフオク計上月"]);
        }

        if (temp["入金日"] == "") {
          temp["入金日"] = null;
        } else {
          temp["入金日"] = new Date(temp["入金日"]);
        }

        if (temp["卸日"] == "") {
          temp["卸日"] = null;
        } else {
          temp["卸日"] = new Date(temp["卸日"]);
        }

        data.push(temp);
        this.grid.notifyInsertItem(data.length - 1, this.state.addRowData);
        this.setState({
          total: this.state.total + 1,
          lastIndex: this.state.lastIndex + 1,
        });
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
    if (this.grid.activeCell == null) return;

    let data = this.state.data;

    if (event.ctrlKey && event.code === "KeyC") {
      this.activeRowIndex = this.grid.activeCell.rowIndex;
      const copiedRow = data[this.activeRowIndex];
      this.setState({
        copiedRowIndex: this.activeRowIndex,
        copiedRow: copiedRow,
      });
      console.log("CPIED: ", this.activeRowIndex);
    }
  };

  public onKeyUp = async (event: any) => {
    if (this.grid.activeCell == null || this.state.copiedRow == null) return;

    const data = this.state.data; // Make a copy of data array

    if (event.ctrlKey && event.code === "KeyV") {
      console.log("PASETD");

      if (!this.state.isAddRowFocused) {
        this.activeRowIndex = this.grid.activeCell.rowIndex;
        const rowId = data[this.activeRowIndex]["id"];
        const rowNo = data[this.activeRowIndex]["商品No"];
        const rowDate = data[this.activeRowIndex]["取引日"];

        // Remove the original row from the array
        data.splice(this.activeRowIndex, 1);

        // Create a new object with the copied row data
        const newRowData = { ...this.state.copiedRow };
        newRowData["id"] = rowId;
        newRowData["商品No"] = rowNo;
        newRowData["取引日"] = rowDate;
        newRowData["操作"] = 1;

        // Insert the new row at the active row index
        data.splice(this.activeRowIndex, 0, newRowData);

        this.setState({ data: data });
        this.grid.notifyInsertItem(this.activeRowIndex, 1);

        //set history
        let obj = {} as any;

        obj["field"] = "コピー済み";
        obj["product_number"] = rowNo;
        obj["old_value"] = "商品" + this.state.copiedRow["商品No"];
        obj["new_value"] = "商品" + rowNo;
        obj["username"] = this.userName;

        this.changedHistoryData.push(obj);
      } else {
        const addRowData = this.state.addRowData;
        const productNo = addRowData["商品No"];
        const registerDT = addRowData["取引日"];

        const newRowData = { ...this.state.copiedRow };
        newRowData["商品No"] = productNo;
        newRowData["取引日"] = registerDT;

        //set temp images with coping images at added row newly
        if (newRowData["画像"].length > 0) {
          const images = newRowData["画像"];
          const res = await api.store.setTempImage({ images: images });

          if (res.status == 200) {
            newRowData["画像"] = res.data.newImageNames;
          }
        }

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

    this.setState({
      modalRow: this.grid.dataSource[rowIndex],
      openDetailModal: true,
      modalImages: [],
      modalComments: [],
    });
    this.show_saveButton = false;
    const s_date = this.grid.dataSource[rowIndex]?.["取引日"];
    const w_date = this.grid.dataSource[rowIndex]?.["卸日"];
    const p_date = this.grid.dataSource[rowIndex]?.["入金日"];
    const current_date = new Date();

    if (w_date == null || p_date == null) {
      this.show_saveButton = true;
    } else if (s_date != null) {
      if (current_date.toLocaleDateString() == s_date.toLocaleDateString())
        this.show_saveButton = true;
    } else this.show_saveButton = true;

    //get history
    const id = this.grid.dataSource[rowIndex]["id"];

    this.rowIndex = rowIndex;
    this.new_modal_data = this.grid.dataSource[rowIndex];
    const res = await api.store.getSaleHistory(id);

    this.setState({ historyData: res.data.data });
  };

  public onSaveDetailModal = async () => {
    let data = this.state.modalRow;
    data["画像"] = data["画像"]?.concat(this.state.modalImages);
    data["画像フリーコメント"] = data["画像フリーコメント"]?.concat(
      this.state.comments
    );

    //save changed value
    if (this.state.modalRow["id"]) {
      const res = await api.store.updateModalSale(data);
    } else {
      const res = await api.store.createSale(this.state.modalRow);
    }

    this.grid.notifySetItem(this.rowIndex, this.new_modal_data, data);
    this.setState({ openDetailModal: false });
    toast.success("保存されました。");
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
      rowIndex = this.grid.activeCell.rowIndex;
      rowId = this.grid.dataSource[rowIndex]?.id;
    }

    await api.store
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
            this.setState({ modalComments: comments });
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

  public onChangeImages = (value: any) => {
    if (this.state.openDetailModal) this.setState({ tempImages: value });
    else this.setState({ images: value });
  };

  public onViewImage = (imageId: any) => {
    let imageURL: any;
    let imageComment: any;

    if (this.state.isAddRow) {
      let images = this.state.addRowData["画像"];
      this.isImageLink(images).then((result: boolean) => {
        if (result) {
          images = this.state.addRowData["画像"];
        }
      });
      imageURL = this.IMAGE_PATH + "temp/" + images[imageId];
    } else {
      const rowIndex = this.grid.activeCell.rowIndex;
      imageComment =
        this.grid.dataSource[rowIndex]["画像フリーコメント"][imageId] ||
        "コメントなし";
      const images = this.grid.dataSource[rowIndex]["画像"];
      imageURL = this.IMAGE_PATH + images[imageId];
    }

    this.setState({ imageURLID: imageId });
    this.setState({ imageURL: imageURL });
    this.setState({ imageComment: imageComment });
    this.setState({ openViewModal: true });
  };

  public async isImageLink(link: string): Promise<boolean> {
    try {
      const response = await fetch(link);
      const contentTypeHeader = response.headers.get("Content-Type");

      if (contentTypeHeader && contentTypeHeader.startsWith("image/")) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  public nextImageView = () => {
    let images: any;
    let imageId: any;

    if (this.state.isAddRow) {
      images = this.state.addRowData["画像"];
      imageId = this.state.imageURLID + 1;
    } else {
      const rowIndex = this.grid.activeCell.rowIndex;
      images = this.grid.dataSource[rowIndex]["画像"];
      imageId = this.state.imageURLID + 1;
    }

    if (imageId == images.length) this.onViewImage(0);
    else this.onViewImage(imageId);
  };

  public prevImageView = () => {
    let images: any;
    let imageId: any;

    if (this.state.isAddRow) {
      images = this.state.addRowData["画像"];
      imageId = this.state.imageURLID - 1;
    } else {
      const rowIndex = this.grid.activeCell.rowIndex;
      images = this.grid.dataSource[rowIndex]["画像"];
      imageId = this.state.imageURLID - 1;
    }

    if (imageId < 0) this.onViewImage(images.length - 1);
    else this.onViewImage(imageId);
  };

  public onRemoveImages = async () => {
    let rowId: any;
    let rowIndex: number;

    if (this.state.isAddRow) rowId = "isAddRow";
    else {
      rowIndex = this.grid.activeCell.rowIndex;
      rowId = this.grid.dataSource[rowIndex]?.id;
    }

    await api.store
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

  public convertDate = (excelDate: number) => {
    // const excelDate = 43647;
    const convertedDate = new Date(
      Math.round((excelDate - 25569) * 86400 * 1000) - 9 * 60 * 60 * 1000
    );
    return convertedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  public convertTime = (excelTime: number) => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const excelDate = new Date(
      excelTime * millisecondsPerDay - 9 * 60 * 60 * 1000
    );
    return excelDate.toLocaleTimeString(undefined, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  //upload csv
  public onLoadFile = (event: any) => {
    const file = event.target.files[0];
    this.setState({ choosedExcelFile: file });
    this.setState({ openChooseStoreModal: true });
    event.target.value = "";
  };

  public onUploadExcel = (event: any) => {
    this.setState({ openChooseStoreModal: false });

    const storeName = this.state.choosedStoreName;
    if (storeName == null || storeName == "") {
      toast.warning("店舗名を入力してください。");
      return;
    }

    const file = this.state.choosedExcelFile;
    if (!file) return;
    if (
      file.type !=
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      toast.warning(
        "申し訳ありませんが、xlsxフォーマットのファイルを入れてください。"
      );
      return;
    }

    this.setState({ loading: true });

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets["売上表"];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const final_results = [] as any;
      jsonData.forEach((element: any, index) => {
        if (index > 1 && element[1]) {
          final_results.push({
            商品No: index - 1,
            店舗名: storeName,
            取引日: element[1] ? this.convertDate(element[1]) : "",
            時刻: element[2] ? this.convertTime(element[2]) : "",
            "成約/不成約": element[3] ? element[3] : "",
            担当者: element[4] ? element[4] : "",
            氏名: element[7] ? element[7] : "",
            フリガナ: element[8] ? element[8] : "",
            年齢: element[9] ? element[9] : "",
            性別: element[10] ? element[10] : "",
            電話番号: element[11] ? element[11] : "",
            住所: element[12] ? element[12] : "",
            来店動機A: element[13] ? element[13] : "",
            来店動機B: element[14] ? element[14] : "",
            折込エリアorメモ: element[43] ? element[43] : "",
            商品種別A: element[16] ? element[16] : "",
            商品種別B: element[17] ? element[17] : "",
            商品: element[18] ? element[18] : "",
            ブランド名: "",
            "型番/シリアル": "",
            ランク: "",
            業者名1: "",
            業者名2: "",
            業者名3: "",
            業者名4: "",
            業者名5: "",
            最高額業者: "",
            業者最高額: "",
            状態: "",
            数量: element[19] ? element[19] : "",
            金属種別: element[20] ? element[20] : "",
            グラムor額面: element[21] ? element[21] : "",
            買取額: element[22] ? element[22] : "",
            売上額: element[23] ? element[23] : "",
            送料: element[24] ? element[24] : "",
            落札手数料: element[28] ? element[28] : "",
            "売上＋送料": element[25] ? element[25] : "",
            決済方法: element[26] ? element[26] : "",
            ヤフオク計上月: element[27] ? this.convertDate(element[27]) : "",
            粗利益: element[29] ? element[29] : "",
            卸日: element[30] ? this.convertDate(element[30]) : "",
            入金日: element[32] ? this.convertDate(element[32]) : "",
            卸先: element[34] ? element[34] : "",
            オークションID: element[35] ? element[35] : "",
            備考: element[40] ? element[40] : "",
            画像: [],
            入力者: element[42] ? element[42] : "",
            画像フリーコメント: "",
            メールアドレス: "",
          });
        }
      });

      await api.store.csvUploadSales(final_results).then((response: any) => {
        if (response.data.success === true) {
          // this.setState({ loading: false });
          window.location.reload();
        }
      });
    };

    reader.readAsArrayBuffer(file);
  };

  public onExportExcel = (t: string) => {
    let data = [] as any;

    data = [
      [
        "商品No",
        "店舗名",
        "取引日",
        "時間",
        "成約/不成約",
        "買取担当",
        "氏名",
        "フリガナ",
        "年齢",
        "性別",
        "電話番号",
        "住所",
        "来店動機A",
        "来店動機B",
        "折込エリア",
        "orメモ",
        "商品種別A",
        "商品種別B",
        "商品",
        "ブランド名",
        "型番/シリアル",
        "ランク",
        "業者名１",
        "業者名２",
        "業者名3",
        "業者名4",
        "業者名5",
        "最高額業者",
        "業者最高額",
        "状態",
        "数量",
        "金属種別",
        "グラム or額面",
        "買取額",
        "売上額",
        "送料",
        "売上+送料",
        "決済方法",
        "ヤフオク計上月",
        "落札手数料",
        "粗利益",
        "卸日",
        "入金日",
        "卸先",
        "オークションID",
        "備考",
        "画像",
        "打込者",
      ],
    ];

    this.state.data.forEach((element: any, index: number) => {
      data.push([
        element["商品No"],
        element["店舗名"],
        element["取引日"],
        element["時刻"],
        element["成約/不成約"],
        element["買取担当"],
        element["氏名"],
        element["フリガナ"],
        element["年齢"] + " 歳",
        element["性別"],
        element["電話番号"],
        element["住所"],
        element["来店動機A"],
        element["来店動機B"],
        element["折込エリア"],
        element["orメモ"],
        element["商品種別A"],
        element["商品種別B"],
        element["商品"],
        element["ブランド名"],
        element["型番/シリアル"],
        element["ランク"],
        element["業者名１"],
        element["業者名２"],
        element["業者名3"],
        element["業者名4"],
        element["業者名5"],
        element["最高額業者"],
        "¥ " + element["業者最高額"],
        element["状態"],
        element["数量"],
        element["金属種別"],
        element["グラム or額面"],
        "¥ " + element["買取額"],
        "¥ " + element["売上額"],
        "¥ " + element["送料"],
        "¥ " + (parseFloat(element["売上額"]) + parseFloat(element["送料"])),
        element["決済方法"],
        element["ヤフオク計上月"],
        element["落札手数料"],
        "¥ " + element["粗利益"],
        element["卸日"],
        element["入金日"],
        element["卸先"],
        element["オークションID"],
        element["備考"],
        "",
        element["打込者"],
      ]);
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
