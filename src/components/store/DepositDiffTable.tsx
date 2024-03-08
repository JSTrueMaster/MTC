import React from "react";
import api from "src/api";
import { ExportToCsv } from 'ts-export-to-csv';
import { ToastContainer, toast } from 'react-toastify';
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
} from 'igniteui-react-grids';


// importing localization data:
import { Localization } from 'igniteui-react-core';
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();


export default class DepositDiffTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public toolbar: IgrDataGridToolbar;

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40

  //set value
  public accounts = ['三菱UFJ銀行', 'ジャパンネット銀行', 'C銀行']

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
      accounts: this.accounts,
      total: 0,
      storeName: props.storeName == '' ? localStorage.getItem('storeName').split(",")[0] : props.storeName,
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
        this.onGetData();
      }, 500);
    }
  }

  public onGetData = async () => {

    const res = await api.store.getDeposit({
      storeName: this.state.storeName
    })

    const data = res.data.data

    let changedTypeData: any[] = []

    data.forEach((item: any) => {
      item['入金日'] = item['入金日'] ? new Date(item['入金日']) : null
      this.accounts.forEach((element: string) => {
        item[element] = parseFloat(item[element.toLowerCase()])
      })
      changedTypeData.push(item)
    })
    this.setState({ data: changedTypeData, total: changedTypeData.length,loading: false })
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
        <div className="gird-container h-full">
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
              background: '#0066FF',
              border: 1,
              borderColor: '#24BFF2',
              borderRadius: 22,
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
              marginRight: 0.5,
            }}
              onClick={(event) => {
                event.preventDefault()
                this.onExportCSV("入金日別差異確認表")
              }}>
              Excelダウンロード
            </Button>
          </Box>

          <div className="igr-table h-full">
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
              selectionMode="MultipleRow"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              notifyOnAllSelectionChanges={true}
              // cellValueChanging={this.onCellValueChanging}
              // activeCellChanged={this.onActiveCellChange}
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
              <IgrDateTimeColumn field="入金日" dateTimeFormat={0} formatOverride={this.formatter}/>

              <IgrNumericColumn field={this.state.accounts[0]} positivePrefix="¥" showGroupingSeparator="true"/>
              <IgrNumericColumn field={this.state.accounts[1]} positivePrefix="¥" showGroupingSeparator="true"/>
              <IgrNumericColumn field={this.state.accounts[2]} positivePrefix="¥" showGroupingSeparator="true"/>

              <IgrNumericColumn field="入金合計" positivePrefix="¥" showGroupingSeparator="true"/>
              <IgrNumericColumn field="売上表" positivePrefix="¥" showGroupingSeparator="true"/>
              <IgrNumericColumn field="売上表差異" positivePrefix="¥" showGroupingSeparator="true"/>
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

  }

  public onToolbarRef = (toolbar: IgrDataGridToolbar) => {
    this.toolbar = toolbar;
    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }
  }

  //export csv
  public onExportCSV = (t: string) => {
    let data = [] as any
  this.state.data.forEach((element: any, index: number) => {
    const arr = [] as any
    const title  =[] as any

    Object.entries(element).map(([key, value]) => {
      if (key != '$hashCode') {
        if(index == 0)title.push(key)
        if(key == "入金日"){
          arr.push(value)
        }else{
          // eslint-disable-next-line no-case-declarations
          const v = (typeof value === 'number') ? value : Number(value);
          arr.push(this.currencyFormatter(v))
        }
        
      }
    })
    if(index == 0)data.push(title)
      data.push(arr)
    })
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, t+".xlsx");
  }
  public currencyFormatter = (number :  number | bigint) =>{
    return new Intl.NumberFormat('en-JP', { style: 'currency', currency: 'JPY' }).format(number)
  }

}

