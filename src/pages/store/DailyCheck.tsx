import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import { validateDate } from "@mui/x-date-pickers/internals";
import { ValueBrushScaleDescription } from "igniteui-react-core";
import LReportMailTable from "src/components/store/LReportMailTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const DailyCheck = () => {

  const [data, setData]: any = React.useState([])
  const [visible, setVisible] = React.useState(false)
  
  let DailyCheckData: any = {};
  
  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const getData = async () => {
    const res = await api.store.getDailyCheckData({
      storeName: storeName == '' ? localStorage.getItem('storeName').split(",")[0] : storeName
    })
    DailyCheckData = res.data.data
    if (DailyCheckData) {
      setData(DailyCheckData);
      setVisible(true);
    }
  }
  
  React.useEffect(() => {
    getData();
    changeElementValue("subTitle", "日々チェック");
  }, [storeName])
  
  return (
    <div className="flex w-11/12 h-[75%] mx-auto mt-5">
      <table className="dailyCheck m-auto">
        <thead>
          <tr>
            <th></th>
            <th>額</th>
          </tr>
        </thead>
        <tbody>
          { 
              <>
                <tr>
                  <td >初期費用</td>
                  <td>¥{data['初期費用']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td>利息</td>
                  <td>¥{data['利息']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td>卸金</td>
                  <td>¥{data['卸金']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td>計 （A）</td>
                  <td>¥{data['合計1']?.toLocaleString()}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                </tr>
                <tr >
                  <td>買取金</td>
                  <td>¥{data['買取金']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td>経費</td>
                  <td>¥{data['経費']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td>かんたん決済</td>
                  <td>¥{data['かんたん決済']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td className="p-3">計 （B）</td>
                  <td>¥{data['合計2']?.toLocaleString()}</td>
                </tr>    
                <tr>
                  <td></td>
                  <td></td>
                </tr>
                <tr >
                  <td>A-B</td>
                  <td>¥{data['合計21']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td>現預金残高</td>
                  <td>¥{data['現預金残高']?.toLocaleString()}</td>
                </tr>  
                <tr>
                  <td></td>
                  <td></td>
                </tr>
                <tr >
                  <td>差異有無</td>
                  <td>{data['差異有無']}</td>
                </tr>
                <tr >
                  <td></td>
                  <td>¥{data['差異']?.toLocaleString()}</td>
                </tr>     
                <tr>
                  <td></td>
                  <td></td>
                </tr>
                <tr >
                  <td>売上＋送料</td>
                  <td>¥{data['売上,送料']?.toLocaleString()}</td>
                </tr>
                <tr >
                  <td></td>
                  <td>¥{data['売上+送料']?.toLocaleString()}</td>
                </tr>   
                <tr >
                  <td></td>
                  <td>{data['送料差異有無']}</td>
                </tr>
                <tr >
                  <td></td>
                  <td>¥{data['送料差異']?.toLocaleString()}</td>
                </tr>          
              </>
          }
        </tbody>
      </table>
    </div>
  );
};

export default DailyCheck;
