import { env } from './EnvironmentConfig'

const emailValidError = '正確なメールアドレス形式ではありません。';
const passwordValidError = '数字、小文字、大文字 、特殊文字が 1 文字以上 、文字数が 8 文字以上であること 。';
const pwdValidError = 'パスワードが一致しません。';
const notRegisterUserError = '登録されていないメールです。';
const emptyError = 'この項目は必須です！';
export const APP_NAME = '売るナビ業務システム';
export const AUTH_PREFIX_PATH = '/auth';
export const EMAILVALIDERROR = emailValidError;
export const PASSWORDVALIDERROR = passwordValidError;
export const CONFIRMPASSWORDVALIDERROR = pwdValidError;
export const NOT_REGISTER_USER_ERROR= notRegisterUserError;
export const EMPTYERROR = emptyError;
export const LOGIN_FAILED_ERROR = "メールアドレスまたはパスワードが正しくありません。";
export const CHANGE_PASSWORD_MAIL_CONTENT = '入力いただいたメールアドレス宛にメールを送信しました。<br/>'+
'メールを確認し、1時間以内にパスワードの再設定をお願いします。<br/>'+
'1時間を経過した場合パスワードの再設定はできなくなります。<br/>' +
'もしメールが届かない場合は、入力されたメールアドレスが間違っているか、利用できないか、登録されていません。迷惑メールとして削除されている場合もありますので、メールソフトの設定もあわせてご確認ください。<br/>';

export const API_URL = env.API_ENDPOINT_URL;
export const IMAGE_PATH = env.IMAGE_PATH;
export const FILE_PATH = env.FILE_PATH;

