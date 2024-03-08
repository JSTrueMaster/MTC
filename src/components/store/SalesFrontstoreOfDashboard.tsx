import React from "react";
import api from "src/api";
import { formatDate } from "../../utils/date"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MenuItem, Box, Button, TextField, Select } from "@mui/material";

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
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';
//DatePicker
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as XLSX from 'xlsx';

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();


export default class SalesFrontstoreOfDashboard extends React.Component<any, any> {
  public grid: IgrDataGrid;
  public toolbar: IgrDataGridToolbar;

  //const of style
  public defaultColumnMinWidth = 150
  public cornerRadius = 8
  public rowHeight = 40

  //date format
  public formatter = new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    // day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Tokyo',
  });

  constructor(props: any) {
    super(props);

    this.state = {
      data2: {},
      total: 0,
      loading: false,
      storeName: props.storeName == '' ? localStorage.getItem('storeName').split(",")[0] : props.storeName,
    }

    Localization.register("DataGrid-en", new DataGridLocalizationJa());
    Localization.register("DataVisualization-en", new DataGridSummariesLocalizationJa());
    Localization.register("Calendar-en", new DataGridDateTimeColumnLocalizationJa());
    Localization.register("MultiColumnComboBox-en", new DataGridMultiColumnComboBoxLocalizationJa());
  }

  componentDidMount(): void {
    this.onDateChange()
  }

  componentDidUpdate(prevProps: any) {

    if (this.props.storeName !== prevProps.storeName) {
      // Perform any actions you need when storeName changes
      this.setState({ storeName: this.props.storeName });
      setTimeout(() => {
        console.log(this.state.storeName);

        this.setState({
          total: 0,
        });
        this.onDateChange()

      }, 500);
    }
  }

  public onDateChange = async () => {

    let params = { "keyName": "来店動機B", "valueName": "店舗前", "storeName": this.state.storeName };

    let response = await api.store.SalesElementTableOfDashboard(params)
    const data = response.data.data
    data.forEach((element: any) => {
      element['日付'] = new Date(element['日付'])
    });
    const total = data.length
    this.setState({ data2: data, total: total, loading: false })
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

        <div className="flex flex-col">
          <p className="text-[#4D4D4D] text-center text-[16px] font-bold mb-[-20px]">切 手</p>
          <div className="flex flex-row w-full justify-between">

            <div className="flex flex-row items-center mr-5 ml-5">
              <p className="!m-0">
                検索結果 : &nbsp;&nbsp;{this.state.total} 件
              </p>
            </div>

            {/* Header Button */}
            <Box className="flex flex-row justify-end">

              <IgrDataGridToolbar ref={this.onToolbarRef} columnChooser="true" />
              <Button className="flex my-2"
                sx={{
                  width: 160,
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
                  this.onExportCSV("切 手")
                }}>
                Excelダウンロード</Button>

            </Box>

          </div>

          <div className="igr-table w-[100%] h-[530px]">
            <IgrDataGrid
              ref={this.onGridRef}
              dataSource={this.state.data2}

              editMode={0}
              summaryScope="none"
              filterUIType="FilterRow"
              columnMovingMode={'none'}
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              notifyOnAllSelectionChanges={true}
              cornerRadiusTopRight={this.cornerRadius}
              cornerRadiusTopLeft={this.cornerRadius}
              defaultColumnMinWidth={150}
              rowHeight={this.rowHeight}
              headerBackground="#E6E6E6"
              headerTextColor="#4D4D4D"
              headerTextStyle="Meiryo"
              // height="calc(80% - 40px)"
              height="calc(100% - 20px)"
              width="100%"
            >
              <IgrDateTimeColumn field="日付" dateTimeFormat={0} formatOverride={this.formatter} pinned={'left'} />
              <IgrNumericColumn field="買取金額" positivePrefix="¥" showGroupingSeparator="true" />
              <IgrNumericColumn field="売上金額" positivePrefix="¥" showGroupingSeparator="true" />
              <IgrNumericColumn field="粗利予想" positivePrefix="¥" showGroupingSeparator="true" />
              <IgrNumericColumn field="粗利実績" positivePrefix="¥" showGroupingSeparator="true" />
              <IgrNumericColumn field="買取率" positiveSuffix="%" showGroupingSeparator="true" />
              <IgrNumericColumn field="商品件数" showGroupingSeparator="true" />
            </IgrDataGrid>
          </div>
        </div>
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


  public onExportCSV = (t: string) => {

    let data = [] as any
    this.state.data2.forEach((element: any, index: number) => {
      const arr = [] as any
      const title = [] as any

      Object.entries(element).map(([key, value]) => {
        if (key != '$hashCode') {

          switch (key) {
            case "買取金額":
            case "売上金額":
            case "粗利予想":
            case "粗利実績":
              if (index == 0) title.push(key)
              // eslint-disable-next-line no-case-declarations
              const v = (typeof value === 'number') ? value : Number(value);
              arr.push(this.currencyFormatter(v))
              break;
            case "買取率":
              if (index == 0) title.push(key)
              arr.push(value + "%")
              break;
            case "商品件数":
            case "日付":
              if (index == 0) title.push(key)
              arr.push(value)
              break;
            default:
              break;
          }
        }
      })
      if (index == 0) data.push(title)
      data.push(arr)
    })
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, t + ".xlsx");
  }

  public currencyFormatter = (number: number | bigint) => {
    return new Intl.NumberFormat('en-JP', { style: 'currency', currency: 'JPY' }).format(number)
  }
}

