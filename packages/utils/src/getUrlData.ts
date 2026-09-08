/**
 * @description 获取url参数(已decodeURIComponent)
 * @param {string} [url] - 可选的自定义url。如果不传，则取当前操作页面的url
 * @param {string[]} [excludeKeys] - 可选的需要过滤剔除的参数key数组，例如 ['_ex']
 * @returns {Record<string, string>}
 * @link http://localhost:30441/task-monitor?id=1106&version=1.00.00
 */
export const getUrlData = (url?: string, excludeKeys: string[] = []): Record<string, string> => {
  try {
    let searchPart = '';
    let hashPart = '';

    // 1. 健壮地分离 search(查询字符串) 与 hash(路由模式参数)
    if (url) {
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const hashStr = url.substring(hashIndex);
        const qmIndex = hashStr.indexOf('?');
        hashPart = qmIndex !== -1 ? hashStr.substring(qmIndex + 1) : '';

        const searchStr = url.substring(0, hashIndex);
        const sQmIndex = searchStr.indexOf('?');
        if (sQmIndex !== -1) {
          searchPart = searchStr.substring(sQmIndex + 1);
        } else if (searchStr.includes('=')) {
          searchPart = searchStr; // 兼容形如 a=1 的纯查询参数
        }
      } else {
        const sQmIndex = url.indexOf('?');
        if (sQmIndex !== -1) {
          searchPart = url.substring(sQmIndex + 1);
        } else if (url.includes('=')) {
          searchPart = url;
        }
      }
    } else {
      searchPart = window.location.search.substring(1);
      const hashStr = window.location.hash;
      const qmIndex = hashStr.indexOf('?');
      hashPart = qmIndex !== -1 ? hashStr.substring(qmIndex + 1) : '';
    }

    // eslint-disable-next-line no-inner-declarations
    function parse(queryStr: string): Record<string, string> {
      if (!queryStr) return {};
      return queryStr.split('&').reduce((acc: Record<string, string>, cur) => {
        // 2. 避免通过 split('=') 导致将 value 中包含 = 提取出错误的值并截断
        const equalIndex = cur.indexOf('=');
        let key = '';
        let value = '';

        if (equalIndex !== -1) {
          key = cur.substring(0, equalIndex);
          value = cur.substring(equalIndex + 1);
        } else if (cur) {
          // 值为空的参数如 '?test'
          key = cur;
          value = '';
        }

        // 3. 支持过滤特定指定的 key
        if (key && !excludeKeys.includes(key)) {
          try {
            // 防止有些参数非标准 encode，例如 100% 这种触发URIError
            acc[key] = decodeURIComponent(value);
          } catch (e) {
            acc[key] = value;
          }
        }
        return acc;
      }, {});
    }

    // url query优先级更高,所以放后面覆盖hash部分的参数
    return { ...parse(hashPart), ...parse(searchPart) };
  } catch (error) {
    console.warn('获取URL参数异常:', error);
    return {};
  }
};
