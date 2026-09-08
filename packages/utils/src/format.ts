/**
 * 格式化相关工具函数
 */

/**
 * @description 格式化金额
 * @param amount 金额
 * @param precision 精度
 * @param separator 千分位分隔符
 */
export const formatMoney = (amount: number | string, precision = 2, separator = ','): string => {
  const num = Number(amount);
  if (isNaN(num)) return '0.00';

  const parts = num.toFixed(precision).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return parts.join('.');
};

/**
 * @description 格式化日期
 * @param date 日期
 * @param format 格式
 */
export const formatDate = (date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * @description 格式化文件大小
 * @param bytes 字节数
 * @param precision 精度
 */
export const formatFileSize = (bytes: number, precision = 2): string => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, index)).toFixed(precision);

  return `${size} ${units[index]}`;
};

/**
 * @description 智能日期格式化：今天/昨天/今年(M/D HH:mm)/其他(YYYY/M/D HH:mm)
 * @param date 日期（Date | 可被 Date 解析的字符串 | 时间戳）
 * @returns 格式化后的文案，空值返回 "--"，非法日期回退为原始入参字符串
 */
export const formatDateRelative = (date: Date | string | number): string => {
  if (date === null || date === undefined || date === '') return '--';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date): boolean => a.toDateString() === b.toDateString();
  const pad2 = (n: number): string => String(n).padStart(2, '0');
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  if (isSameDay(d, today)) return `今天 ${time}`;
  if (isSameDay(d, yesterday)) return `昨天 ${time}`;
  if (d.getFullYear() === today.getFullYear()) {
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${time}`;
};
