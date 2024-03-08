import React from "react";
import api from "src/api";
import { formatDate } from "../../utils/date"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MenuItem, Box, Button, TextField, Select } from "@mui/material";
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
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// register() メソッドの実行
IgrDataGridModule.register();
IgrDataGridToolbarModule.register();
IgrGridColumnOptionsModule.register();


export default class LReportMailTable extends React.Component<any, any> {

  public grid: IgrDataGrid;
  public toolbar: IgrDataGridToolbar;

  //const of style
  public defaultColumnMinWidth = 150
  public imgColumnWidth = 300
  public cornerRadius = 8
  public rowHeight = 40
  public currentDate = new Date();
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
      data1: {},
      data2: [],
      loading: true,
      changedData: [],
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
  
  public onDateChange = async (newDate: any) => {
    this.setState({selectedDate: newDate})

    let data1 = {} as any
    let data2 = [] as any
    let date = ("0" + new Date(newDate).getDate()).slice(-2);
    let month = ("0" + (new Date(newDate).getMonth() + 1)).slice(-2);
    let year = new Date(newDate).getFullYear();
    this.newDate = month + "-" + date + "-" + year
    const regex = /^\d{2}-\d{2}-\d{4}$/
    console.log(this.newDate)
    if (regex.test(this.newDate) && year != 1970) {
      this.setState({ loading: true })
      // console.log(formatDate(new Date(newDate).toLocaleDateString(), '-'))
      let result = await api.store.getLReportMailData(this.newDate,{
          storeName: this.state.storeName
        })
      // let result = await api.store.getLReportMailData(formatDate(new Date(newDate).toLocaleDateString(), '-'))
      let res = result.data.data

      data1 = res[0][0]
      let formattedData1: any = {}
      for (const [key, value] of Object.entries(data1)) {
        formattedData1[key] = value?.toLocaleString();
      }

      res[1].forEach((element: any) => {
        element['来店数'] = element['来店数'].toLocaleString()
        data2.push(element)
      });

      this.setState({ data1: {} })
      this.setState({ data2: [] })

      setTimeout(() => {
        this.setState({ data1: formattedData1 })
        this.setState({ data2: data2 })
      }, 100)

      this.setState({ loading: false })
    }

  }

  public onEraseDatePicker = () => {
    this.setState({selectedDate: null});
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

        <div className="flex flex-col gird-container h-full">

          <div className="flex flex-row w-full justify-between">

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
                      },
                    }} />
                </DemoContainer>
              </LocalizationProvider>
              {/* <IconButton aria-label="cancel" className="!ml-[-55px]" onClick={this.onEraseDatePicker}>
                <CancelIcon />
              </IconButton> */}
            </div>

            {/* Header Button */}
            <Box className="flex flex-row justify-end">

              <IgrDataGridToolbar ref={this.onToolbarRef} columnChooser="true" />
              <Button className="flex my-2"
                sx={{
                  width: 134,
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

          </div>

          <div className="flex flex-row justify-between w-full h-full">
            <div className="overflow-y-auto h-[78vh]">
              <table className="reportMail">
                <tbody>
                  {
                    <>
                      <tr >
                        <td>入電数</td>
                        <td>{this.state.data1?.enters}</td>
                      </tr>
                      <tr >
                        <td>来店数</td>
                        <td>{this.state.data1?.visits}</td>
                      </tr>
                      <tr >
                        <td>成約数</td>
                        <td>{this.state.data1?.deals}</td>
                      </tr>
                      <tr >
                        <td>単日買取金額</td>
                        <td>¥{this.state.data1?.price}</td>
                      </tr>
                      <tr>
                        <td>単日粗利予想</td>
                        <td>¥{this.state.data1?.forecast}</td>
                      </tr>
                      <tr >
                        <td>顧客</td>
                        <td>{this.state.data1?.clients}</td>
                      </tr>
                      <tr >
                        <td>紹介</td>
                        <td>{this.state.data1?.introductions}</td>
                      </tr>
                      <tr >
                        <td>店舗前</td>
                        <td>{this.state.data1?.stores}</td>
                      </tr>
                      <tr >
                        <td>HP</td>
                        <td>{this.state.data1?.hp}</td>
                      </tr>
                      <tr >
                        <td>情報誌</td>
                        <td>{this.state.data1?.magazine}</td>
                      </tr>
                      <tr >
                        <td>折込</td>
                        <td>{this.state.data1?.inserts}</td>
                      </tr>
                      <tr >
                        <td>ポスティング</td>
                        <td>{this.state.data1?.postings}</td>
                      </tr>
                      <tr >
                        <td>その他</td>
                        <td>{this.state.data1?.others}</td>
                      </tr>
                      <tr >
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>当月買取金額合計</td>
                        <td>¥{this.state.data1?.total}</td>
                      </tr>
                      <tr >
                        <td>当月粗利予想金額</td>
                        <td>¥{this.state.data1?.estimate}</td>
                      </tr>
                      <tr >
                        <td>単日実績</td>
                        <td>¥{this.state.data1?.single}</td>
                      </tr>
                      <tr>
                        <td>粗利実績</td>
                        <td>¥{this.state.data1?.gross}</td>
                      </tr>
                      <tr >
                        <td>単日経費</td>
                        <td>¥{this.state.data1?.singleExpense}</td>
                      </tr>
                      <tr >
                        <td>月間合計経費</td>
                        <td>¥{this.state.data1?.monthly}</td>
                      </tr>
                      <tr >
                        <td>通帳残金</td>
                        <td>¥{this.state.data1?.passbook}</td>
                      </tr>
                      <tr >
                        <td>現金（金庫）残金</td>
                        <td>¥{this.state.data1?.cash}</td>
                      </tr>
                      <tr >
                        <td>小口残金</td>
                        <td>¥{this.state.data1?.petty}</td>
                      </tr>
                      <tr >
                        <td></td>
                        <td></td>
                      </tr>
                      <tr >
                        <td>通帳入金</td>
                        <td>¥{this.state.data1?.passbookIn}</td>
                      </tr>
                      <tr >
                        <td>通帳出し金</td>
                        <td>¥{this.state.data1?.passbookOut}</td>
                      </tr>
                      <tr >
                        <td>現金（金庫）追加金</td>
                        <td>¥{this.state.data1?.cashIn}</td>
                      </tr>
                      <tr >
                        <td>小口使用金</td>
                        <td>¥{this.state.data1?.prettyFee}</td>
                      </tr>
                    </>
                  }
                </tbody>
              </table>
            </div>

            {/* Table */}
            <div className="igr-table w-[82%] h-[90%]">
              <IgrDataGrid
                ref={this.onGridRef}
                dataSource={this.state.data2}

                editMode={0}
                summaryScope="none"
                filterUIType="none"
                columnMovingMode={'none'}
                headerClickAction={'none'}
                autoGenerateColumns="false"
                isColumnOptionsEnabled="true"
                groupHeaderDisplayMode="Combined"
                // selectionMode="MultipleRow"
                notifyOnAllSelectionChanges={true}
                activeCellChanged={this.onActiveCellChange}
                cellValueChanging={this.onCellValueChanging}

                // isPagerVisible="true"
                // pageSize="10"
                // cellValueChanging={}
                // editOnKeyPress={false}

                cornerRadiusTopRight={this.cornerRadius}
                cornerRadiusTopLeft={this.cornerRadius}
                defaultColumnMinWidth={150}
                rowHeight={this.rowHeight}
                headerBackground="#E6E6E6"
                headerTextColor="#4D4D4D"
                headerTextStyle="Meiryo"
                height="calc(80% - 40px)"
                width="100%"
              >
                <IgrTextColumn field="日付" horizontalAlignment={2} pinned={'left'} />
                <IgrNumericColumn field="粗利実績" positivePrefix="¥" showGroupingSeparator="true" />
                <IgrNumericColumn field="単日使用経費" positivePrefix="¥" showGroupingSeparator="true" />
                <IgrNumericColumn field="入電数" showGroupingSeparator="true" />
                <IgrTextColumn field="来店数" horizontalAlignment={2} />
                <IgrNumericColumn field="成約数" showGroupingSeparator="true" />
                <IgrNumericColumn field="顧客" showGroupingSeparator="true" />
                <IgrNumericColumn field="紹介" showGroupingSeparator="true" />
                <IgrNumericColumn field="店舗前" showGroupingSeparator="true" />
                <IgrNumericColumn field="HP" showGroupingSeparator="true" />
                <IgrNumericColumn field="情報誌" showGroupingSeparator="true" />
                <IgrNumericColumn field="折込" showGroupingSeparator="true" />
                <IgrNumericColumn field="ポスティング" showGroupingSeparator="true" />
                <IgrNumericColumn field="その他" showGroupingSeparator="true" />
              </IgrDataGrid>

              {/* Bottom Button */}
              <Button className="flex my-2 saveBtn" sx={{
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

  //export csv
  public onSendEmail = async () => {
    let params = this.state.data1
    params['currDate'] = formatDate(this.currentDate.toLocaleDateString(), '/')
    params['newDate'] = this.newDate
    params['storeName'] = this.state.storeName
    const result = await api.store.sendLReportMail(params)
    if (result.data.statusCode == 200) {
      toast.info('メールが送信されました！');
    }
    else toast.info("メール転送に失敗しました。")
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

      if (columnKey == '入電数' && dataItem['日付'] != '合 計' && dataItem['来店数'] != '成約率／占有率') {
        s.editMode = 1
      } else {
        s.editMode = 0
      }
    }

  }

  public onCellValueChanging = (s: IgrDataGrid, e: IgrGridCellValueChangingEventArgs) => {
    let rowIndex = s.activeCell.rowIndex;
    const dataItem: any = s.actualDataSource.getItemAtIndex(rowIndex)
    let currData: any = this.state.changedData
    let temp: any = {}
    temp['日付'] = dataItem['日付']
    temp['入電数'] = e.newValue

    currData.push(temp)
    this.setState({ changedData: currData })
  }

  public onSaveChangedData = async () => {

    if (Object.keys(this.state.changedData).length > 0) {
      const result = await api.store.createEnters(this.state.changedData)
      if (result.data.success == true) {
        window.location.reload();
      }
    } else {
      toast.info("変更された項目はありません。")
    }

  }

}

