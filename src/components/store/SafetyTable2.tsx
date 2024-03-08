import React from "react";
import { MenuItem, Box, Button, TextField, Select } from "@mui/material";
import api from "src/api";
import { formatDate } from "src/utils/date"
import Papa, { ParseResult } from 'papaparse';
import { ToastContainer, toast } from 'react-toastify';
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


export default class SafetyTable2 extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public toolbar: IgrDataGridToolbar;

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40
  public changedSafety1Data: any = {}
  public timeZoneOffset = 9 * 60;

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
      total: 0,
      changedData: [],
      loading: true,
      storeName: props.storeName == '' ? localStorage.getItem('storeName').split(",")[0] : props.storeName,
    };

    this.getSafety2();

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
        this.setState({
          total: 0,
        });
        this.getSafety2();
      }, 500);
    }
  }

  public getSafety2 = async () => {
    
    const res = await api.store.getSafety2({ 
      storeName: this.state.storeName
    })

    if (res.data.success == true) {
      let result = res.data.data
      result.forEach((item: any) => {
        item['日付'] = item['日付'] ? new Date(item['日付']) : null
        item['CF残高'] = item['cf残高'] ? parseInt(item['cf残高']) : 0
      })
      this.setState({ data: result, total: result.length })
    }
    else this.setState({ data: [] })
    this.setState({ loading: false })
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
                検索結果 {this.state.total} 件
              </div>
            </div>
            <div
              className="rounded-tl-lg rounded-tr-lg inline-block w-full mt-[-30px] largeFont font-bold overflow-hidden !bg-transparent">
              金庫金確認表
            </div>
            <IgrDataGridToolbar ref={this.onToolbarRef2} columnChooser="true" />
            {/* <input
              accept=".xlsx"
              id="csv-file2"
              type="file"
              style={{ display: 'none' }}
              onChange={this.onUploadXlsx2}
            />
            <label htmlFor="csv-file2">
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
                this.onExportExcel("金庫金確認表")
              }}>
              Excelダウンロード
            </Button>
          </Box>

          <div className="igr-table h-full">
            {/* Table */}
            <IgrDataGrid
              ref={this.onGridRef2}
              dataSource={this.state.data}
              // editMode={0}
              summaryScope="none"
              editOnKeyPress={false}
              filterUIType="FilterRow"
              columnMovingMode={'none'}
              headerClickAction={'none'}
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              // selectionMode="MultipleRow"
              notifyOnAllSelectionChanges={true}
              activeCellChanged={this.onActiveCellChange}
              cellValueChanging={this.onCellValueChanging}

              cornerRadiusTopRight={this.cornerRadius}
              cornerRadiusTopLeft={this.cornerRadius}
              defaultColumnMinWidth={150}
              rowHeight={this.rowHeight}
              headerBackground="#E6E6E6"
              headerTextColor="#4D4D4D"
              headerTextStyle="Meiryo"
              height="calc(100% - 40px)"
              width="100%"
            >
              <IgrDateTimeColumn field="日付" dateTimeFormat={0} isEditable={true} formatOverride={this.formatter} pinned={'left'} width={'*>110'} />
              <IgrNumericColumn field="10,000円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="5,000円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="1,000円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="500円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="100円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="50円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="10円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="5円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="1円" isEditable={true} showGroupingSeparator="true" width={'*>110'} />
              <IgrNumericColumn field="合計" isEditable={false} showGroupingSeparator="true" />
              <IgrNumericColumn field="CF残高" isEditable={false} showGroupingSeparator="true" />
              <IgrNumericColumn field="買取金" isEditable={false} showGroupingSeparator="true" />
              <IgrNumericColumn field="金庫金入金" isEditable={false} showGroupingSeparator="true" />
              <IgrNumericColumn field="金庫金残高" isEditable={false} showGroupingSeparator="true" />
              <IgrTextColumn field="差異確認" isEditable={false} />
            </IgrDataGrid>

            {/* Bottom Button */}

            <Button className="flex my-2 addBtn" sx={{
              width: 93,
              height: 37,
              fontFamily: 'Meiryo',
              color: '#1A1A1A',
              background: '#E6E6E6',
            }}
              onClick={this.onAddRow2}
            >+ 新規登録</Button>

            <Button className="flex my-2 !mx-3 saveBtn" sx={{
              width: 93,
              height: 37,
              fontFamily: 'Meiryo',
              color: '#1A1A1A',
              background: '#E6E6E6',
            }}
              onClick={this.onSaveChangedData}
            >保 存</Button>
          </div>

        </div>
      </>
    );
  }

  //IgrDataGrid methods
  public onGridRef2 = (grid: IgrDataGrid) => {
    if (!grid) { return; }

    this.grid = grid;
    if (!this.grid) {
      return;
    }

    if (this.toolbar !== null) {
      this.toolbar.targetGrid = this.grid;
    }
  }

  public onToolbarRef2 = (toolbar: IgrDataGridToolbar) => {
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

      if (columnKey == '日付' || columnKey == '10,000円' || columnKey == '5,000円' || columnKey == '1,000円' || columnKey == '500円' || columnKey == '100円' || columnKey == '50円' || columnKey == '10円' || columnKey == '5円' || columnKey == '1円') {
        s.editMode = 1
      } else {
        s.editMode = 0
      }
    }
  }

  public changedIndex = [] as any;
  public onCellValueChanging = (s: IgrDataGrid, e: IgrGridCellValueChangingEventArgs) => {

    const rowIndex = s.activeCell.rowIndex;
    if (this.changedIndex.indexOf(rowIndex) == -1) {
      this.changedIndex.push(rowIndex)
    }

    this.setState({ data: s.dataSource })
  }

  public onSaveChangedData = async () => {

    let isDistinct = false
    let changedData = [] as any
    const data = this.state.data

    if (this.changedIndex.length == 0) {
      toast.warning("データの変更はありません。")
      return;
    }

    this.changedIndex.forEach((changedItemIndex: number) => {
      data.forEach((dataItem: any, index: number) => {
        const itemDate = dataItem['日付']
        const changedDate = data[changedItemIndex]['日付']
        if (itemDate.toLocaleDateString() == changedDate.toLocaleDateString() && changedItemIndex !== index) {
          isDistinct = true
        }
      })
      !isDistinct && changedData.push(data[changedItemIndex])
    })

    if (isDistinct) {
      toast.warning("同じ日付のリストもあります!")
      return;
    }

    if (changedData.length > 0) {
      const result = await api.store.createSafety2(changedData)
      if (result.data.success == true) {
        window.location.reload();
      }
    } else {
      toast.error("変更された項目はありません。")
    }
  }

  //add new row
  public onAddRow2 = () => {
    let data = this.state.data
    const new_data = { '日付': new Date(), '10,000円': 0, '5,000円': 0, '1,000円': 0, '500円': 0, '100円': 0, '50円': 0, '10円': 0, '5円': 0, '1円': 0, '合計': '', 'CF残高': '', '経費出費': '', '小口入金': '', '小口残高': '', '差異確認': '' }
    data.push(new_data)
    this.grid.notifyInsertItem(data.length - 1, new_data)
    this.grid.scrollTo(0, 1000000)
  }

  //key event
  public activeRowIndex: number;
  public userName = localStorage.getItem('userName');

  public onKeyDown = (event: any) => {

    let data = this.state.data;

    if ((event.ctrlKey) && event.code === 'KeyC') {

      this.activeRowIndex = this.grid.activeCell.rowIndex;
      this.setState({ copiedRowIndex: this.activeRowIndex, copiedRow: data[this.activeRowIndex] })

      console.log('copied:', this.activeRowIndex)

    }
  }

  public onKeyUp = (event: any) => {
    if (this.grid.activeCell == null) return;

    let data = [...this.state.data]; // Make a copy of data array

    if ((event.ctrlKey) && event.code === 'KeyV') {

      this.activeRowIndex = this.grid.activeCell.rowIndex;
      const rowId = data[this.activeRowIndex]['id'];
      const rowDate = data[this.activeRowIndex]['日付'];

      // Remove the original row from the array
      data.splice(this.activeRowIndex, 1);

      // Create a new object with the copied row data
      const newRowData = { ...this.state.copiedRow };
      newRowData['id'] = rowId
      newRowData['日付'] = rowDate
      newRowData['合計'] = newRowData['10,000円'] * 10000 + newRowData['5,000円'] * 5000 + newRowData['1,000円'] * 1000 + newRowData['500円'] * 500 + newRowData['100円'] * 100 + newRowData['50円'] * 50 + newRowData['10円'] * 10 + newRowData['5円'] * 5 + newRowData['1円']
      newRowData['CF残高'] = ''
      newRowData['経費出費'] = ''
      newRowData['小口入金'] = ''
      newRowData['小口残高'] = ''
      newRowData['差異確認'] = ''

      // Insert the new row at the active row index
      data.splice(this.activeRowIndex, 0, newRowData);


      this.setState({ data: data });
      this.grid.notifyInsertItem(this.activeRowIndex, 1);

      if (this.changedIndex.indexOf(this.activeRowIndex) == -1) {
        this.changedIndex.push(this.activeRowIndex)
      }

    }
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
  public onUploadXlsx2 = (event: any) => {

    // const storeName = prompt("店舗名を入力してください。");
    // if (storeName == null || storeName == '') {
    //   toast.warning('店舗名を入力してください。');
    //   return;
    // }
    const storeName = localStorage.getItem('storeName');

    const file = event.target.files[0];
    if (!file) return;
    if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast.warning('申し訳ありませんが、xlsxフォーマットのファイルを入れてください。')
      return;
    }

    this.setState({ loading: true })

    const reader = new FileReader();

    reader.onload = async (e) => {

      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets['小口・金庫金確認表'];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const final_results = [] as any;
      jsonData.forEach((element: any, index) => {
        if (index > 1 && element[0]) {
          final_results.push({
            '日付': element[18] ? this.convertDate(element[18]) : '',
            '店舗名': storeName,
            '10,000円': element[19] ? element[19] : 0,
            '5,000円': element[20] ? element[20] : 0,
            '1,000円': element[21] ? element[21] : 0,
            '500円': element[22] ? element[22] : 0,
            '100円': element[23] ? element[23] : 0,
            '50円': element[24] ? element[24] : 0,
            '10円': element[25] ? element[25] : 0,
            '5円': element[26] ? element[26] : 0,
            '1円': element[27] ? element[27] : 0,
          });
        }
      });

      await api.store.createSafety2(final_results).then((response: any) => {
        if (response.data.success === true) {
          // this.setState({ loading: false });
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
          key != "CF残高" &&
          key != "v"
        ) {
          if (index == 0) {
            if (key == "cf残高") title.push("CF残高")
            else title.push(key)
          }
          switch (key) {
            case "小口残高":
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
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, t + ".xlsx");
  }

  public currencyFormatter = (number: number | bigint) => {
    return new Intl.NumberFormat('en-JP', { style: 'currency', currency: 'JPY' }).format(number)
  }

}

