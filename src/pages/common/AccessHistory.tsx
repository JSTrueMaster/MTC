import React from "react";
import Modal from '@material-ui/core/Modal';
import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import changeElementValue from "src/utils/elementvalue";
import Avatar from '@mui/material/Avatar';
import api from "src/api";
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import PersonIcon from '@mui/icons-material/Person';
import Typography from '@mui/material/Typography';
import { Radio, RadioGroup } from '@mui/material';
import Api from "src/api";

const AccessHistory = () => {
  // let data: any = [];
  const [data, setData] = useState([])
  const [totals, setTotals] = useState(0);
  const [openModal, setOpenModal] = useState(false)

  const fetchAccessHistory = () => {
    Api.user.fetchAccessHistory().then((response: any) => {
      setData([...response.data]);
      setTotals(response.data.length);
    })
  }
  changeElementValue("subTitle", "アクセス管理");

  useEffect(() => {
    const abortController = new AbortController();
    fetchAccessHistory();
    return () => abortController.abort();
  }, [])

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [address, setAddress] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisiTime] = useState("");
  const [storeName, setStoreName] = useState("");
  const [addressIP, setAddressIP] = useState("");
  const [browserType, setBrowserType] = useState("");
  const [isRadioDisabled, setIsRadioDisabled] = useState(false)

  const handleDetailEvent = async (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    let attr = target.getAttribute("data-id");
    if (attr == null) return;
    const response = await api.user.detailCollection(attr);
    // if(response.statusCode != 200) return;
    setFirstName(response.data.user.personalInfo.firstName);
    setLastName(response.data.user.personalInfo.lastName);
    setGender(response.data.user.personalInfo.gender);
    if (response.data.user.personalInfo.gender == "男性") {
      setIsRadioDisabled(true)
    } else {
      setIsRadioDisabled(false)
    }
    setPhoneNum(response.data.user.personalInfo.phoneNum);
    setAddress(response.data.user.personalInfo.address);
    setVisitDate(target.getAttribute("data-date"));
    setVisiTime(target.getAttribute("data-time"));
    setStoreName(target.getAttribute("data-store"));
    setAddressIP(target.getAttribute("data-ip"));
    setBrowserType(target.getAttribute("data-browser"));
    setOpenModal(true);
  };

  return (
    <div className="mt-5">
      <div className="flex flex-col">
        <div className="w-11/12 mx-auto my-3 px-3 text-[#4D4D4D] font-[400]">
          検索結果 {totals} 件
        </div>
        <table className="table-scroll small-first-col w-11/12 m-auto">
          <thead className="bg-[#E6E6E6] text-[#4D4D4D] font-[700]">
            <tr>
              <th>アクセス日時</th>
              <th>アクセス時間</th>
              <th>店舗名</th>
              <th>ユーザー名</th>
              <th>IPアドレス</th>
              <th>ブラウザ</th>
              <th>操 作</th>
            </tr>
          </thead>

          <tbody className="body-half-screen text-[#1A1A1A] font-[400]">
            {data.map((item: any, index: number) => {
              return (
                <tr key={item.id}>
                  <td >
                    <div>{item.date}</div>
                  </td>
                  <td >
                    <div>{item.time.replace(/-/g, ':')}</div>
                  </td>
                  <td >
                    <div>{item.store}</div>
                  </td>
                  <td >
                    <div>{item.user}</div>
                  </td>
                  <td >
                    <div>{item.ip}</div>
                  </td>
                  <td >
                    <div>{item.browser}</div>
                  </td>
                  <td >
                    <button
                      className=" border-none  text-[#0066FF] rounded transition duration-300  focus:outline-none" onClick={handleDetailEvent} data-id={item.id} data-ip={item.ip} data-browser={item.browser} data-store={item.store} data-date={item.date} data-time={item.time.replace(/-/g, ':')}>詳細</button>
                  </td>
                </tr>);
            })}

          </tbody>
        </table>
      </div >

      <Modal
        open={openModal}
        style={{
          position: 'absolute',
          margin: 'auto',
          height: 600,
          width: 700,
        }}
        onClose={() => {
          setFirstName("");
          setLastName("");
          setGender("");
          setPhoneNum("");
          setAddress("");
          setVisitDate("");
          setVisiTime("");
          setStoreName("");
          setAddressIP("");
          setBrowserType("");
          setOpenModal(false)
        }}
        disableEnforceFocus
      >
        <div className="flex flex-col w-full h-full bg-white rounded-[11px]">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ width: "100px", height: "100px", bgcolor: '#24BFF2', marginBottom: '30px' }}>
              <PersonIcon className="!w-[90px] !h-[90px]" sx={{ color: "#fff" }} />
            </Avatar>

            <Box sx={{ mt: 3 }}>
              <Grid container className="meiryo font-Noto">
                <Grid item xs={12} sm={6} className="border-t-0 border-b-0 border-r-1 border-solid border-[#D7D7D7]">
                  <Grid container sx={{ padding: "0 35px !important" }}>
                    <Grid item xs={12} sm={4} className="self-center">
                      <Typography className="middleFont text-[#1A1A1A] my-3">氏名</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} className="self-center">
                      <Typography className="middleFont text-[#1A1A1A] my-3">{firstName} {lastName}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={4} className="self-center">
                      <Typography className=" text-[#1A1A1A] my-3">店舗名</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} className="self-center">
                      <Typography className=" text-[#1A1A1A] my-3">{storeName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} className="self-center">
                      <Typography className=' text-[#1A1A1A] my-2'>性別</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} className="self-center my-2">
                      <RadioGroup
                        id="gender"
                        name="gender"
                        defaultValue=""
                        className="middleFont"
                        aria-labelledby="demo-radio-buttons-group-label"
                        row
                        value={gender}
                        sx={{
                          mb: "0px !important",
                        }}
                      >
                        <FormControlLabel disabled={true} value="男性" control={<Radio sx={{ cursor: 'default' }} />} label="男性" sx={{ cursor: 'default' }} />
                        <FormControlLabel disabled={true} value="女性" control={<Radio sx={{ cursor: 'default' }} />} label="女性" sx={{ cursor: 'default' }} />
                      </RadioGroup>
                    </Grid>

                    <Grid item xs={12} sm={4} className="self-center my-3">
                      <Typography className=" text-[#1A1A1A]">電話番号</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} className="self-center my-3">
                      <Typography className=" text-[#1A1A1A]">{phoneNum}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={4} className="self-center my-3">
                      <Typography className=" text-[#1A1A1A]">住所</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} className="self-center my-3">
                      <Typography className=" text-[#1A1A1A]">{address}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Grid container sx={{ padding: "0 35px !important" }}>
                    <Grid item xs={12} sm={5}>
                      <Typography className="middleFont text-[#1A1A1A] mt-5 mb-3">アクセス日時</Typography>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Typography className="middleFont text-[#1A1A1A] mt-5 mb-3">{visitDate}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <Typography className=" text-[#1A1A1A] my-3">アクセス時間</Typography>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Typography className=" text-[#1A1A1A] my-3">{visitTime}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <Typography className=" text-[#1A1A1A] my-3">IPアドレス</Typography>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Typography className=" text-[#1A1A1A] my-3">{addressIP}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <Typography className=" text-[#1A1A1A] my-3">ブラウザ</Typography>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Typography className=" text-[#1A1A1A] my-3">{browserType}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

              </Grid>
            </Box>
          </Box>

        </div>

      </Modal>

    </div >
  );
};

export default AccessHistory;
//v-if="pagination.current_page < pagination.last_page"