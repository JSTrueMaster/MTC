import React from "react";
import { MenuItem, Box, Button, TextField, Select } from "@mui/material";
import api from "src/api";
import { formatDate } from "src/utils/date"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
} from 'igniteui-react-grids';

// importing localization data:
import { Localization } from 'igniteui-react-core';
import { DataGridLocalizationJa, DataGridSummariesLocalizationJa, DataGridDateTimeColumnLocalizationJa, DataGridMultiColumnComboBoxLocalizationJa } from 'src/constants/DataGridLocaleJa';
//DatePicker
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();


export default class SafetyMailTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public toolbar: IgrDataGridToolbar;

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40
  public currentDate = new Date();
  public tempMail = {} as any
  public newDate = "" as string;

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
      loading: true,
      data: props.data,
      selectedDate: this.currentDate,
      storeName: props.storeName == '' ? localStorage.getItem('storeName').split(",")[0] : props.storeName,
    }

    Localization.register("DataGrid-en", new DataGridLocalizationJa());
    Localization.register("DataVisualization-en", new DataGridSummariesLocalizationJa());
    Localization.register("Calendar-en", new DataGridDateTimeColumnLocalizationJa());
    Localization.register("MultiColumnComboBox-en", new DataGridMultiColumnComboBoxLocalizationJa());
  }

  componentDidMount(): void {
    this.onDateChange(this.currentDate)
  }

  componentDidUpdate(prevProps: any) {

    if (this.props.storeName !== prevProps.storeName) {
      // Perform any actions you need when storeName changes
      this.setState({ storeName: this.props.storeName });
      setTimeout(() => {
        this.onDateChange(this.currentDate);
      }, 500);
    }
  }
  public onEraseDatePicker = () => {
    this.setState({ selectedDate: null });
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
          <Box className="flex flex-row justify-between">
            <div className="flex flex-row items-center">
              <p className="!m-0">
                集計日：
              </p>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ja'>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker label="" value={dayjs(this.state.selectedDate)} onChange={(newDate) => this.onDateChange(newDate)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        width: 150,
                        fontSize: 'inherit',
                      },
                      "fieldset": {
                        border: 'none',
                      }
                    }} />
                </DemoContainer>
              </LocalizationProvider>
              {/* <IconButton aria-label="cancel" className="!ml-[-55px]" onClick={this.onEraseDatePicker}>
                <CancelIcon />
              </IconButton> */}
            </div>
            <Button className="flex my-2"
              sx={{
                minWidth: 134,
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
              onClick={this.onSendEmail}
            >メールを送信する</Button>

          </Box>

          <div className="igr-table h-full">
            {/* Table */}
            <IgrDataGrid
              ref={this.onGridRef}
              dataSource={this.state.data}
              autoGenerateColumns="false"
              isColumnOptionsEnabled="true"
              groupHeaderDisplayMode="Combined"
              editOnKeyPress={false}
              editMode={0}
              headerClickAction={'none'}    //SORT
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
              {/* <IgrTextColumn field="#" dataBound={this.onCellDataBound} /> */}
              <IgrDateTimeColumn field="カテゴリー" dataBound={this.onCellDataBound} formatOverride={this.formatter} width={'*>100'} />
              <IgrNumericColumn field="10,000円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="5,000円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="1,000円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="500円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="100円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="50円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="10円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="5円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="1円" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
              <IgrNumericColumn field="合計" positivePrefix="¥" dataBound={this.onCellDataBound} showGroupingSeparator="true" width={'*>100'} />
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

  public onCellDataBound = (s: any, e: IgrDataBindingEventArgs) => {
    // console.log(e.cellInfo.rowItem)
  }

  //export csv
  public onSendEmail = async () => {
    if (this.tempMail[0] && this.tempMail[1]) {
      this.tempMail[0]['合計'] = this.currencyFormatter(this.tempMail[0]['合計'])
      this.tempMail[1]['合計'] = this.currencyFormatter(this.tempMail[1]['合計'])
    }
    const result = await api.store.sendSafetyMail(this.tempMail)
    if (result.data.statusCode == 200) {
      toast.info('メールが送信されました！');
    }
    else toast.info("メール転送に失敗しました。")
  }

  public onDateChange = async (newDate: any) => {

    this.setState({ selectedDate: newDate })

    let date = ("0" + new Date(newDate).getDate()).slice(-2)
    let month = ("0" + (new Date(newDate).getMonth() + 1)).slice(-2)
    let year = new Date(newDate).getFullYear()
    this.newDate = year + "/" + month + "/" + date
    const regex = /^\d{4}\/\d{2}\/\d{2}$/
    console.log(this.newDate)
    if (regex.test(this.newDate) && year != 1970) {
      this.setState({ loading: true })
      const result = await api.store.getSafetyMailData(month + "-" + date + "-" + year, { storeName: this.state.storeName })
      let temp: any = [...result.data.data]
      this.tempMail = [...result.data.data]
      if (temp[0] && temp[1]) {
        delete temp[0].日付
        delete temp[1].日付
        temp[0].カテゴリー = '金庫残金'
        temp[1].カテゴリー = '小口残金'
        this.tempMail = [...temp]
        this.tempMail.push({ "newDate": this.newDate })
        this.setState({ data: temp })
      } else {
        toast.warning("表示するデータがありません。")
      }
      this.setState({ loading: false })
    }
  }

  public currencyFormatter = (number: number | bigint) => {
    return new Intl.NumberFormat('en-JP', { style: 'currency', currency: 'JPY' }).format(number)
  }
}

