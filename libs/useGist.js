/**
 * GitHub Gist를 데이터 저장소로 사용할 수 있게 합니다.
 * (주의: Tampermonkey 환경에서 GM_xmlhttpRequest 권한이 필요합니다.)
 * * @param {string} gistId - Gist의 ID (URL의 마지막 부분)
 * @param {string} token - GitHub Personal Access Token (classic, 'gist' 권한 필요)
 * @param {string} [fileName="config.json"] - 저장할 파일 이름
 * @returns {Object} { get: Function, set: Function }
 * * @example
 * const { get, set } = useGist("gist_id_here", "ghp_token_here");
 * const data = await get();
 * await set({ ...data, theme: 'dark' });
 */
function useGist(gistId, token, fileName = "config.json") {
  const apiUrl = `https://api.github.com/gists/${gistId}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  };

  return {
    /**
     * Gist에서 데이터를 읽어와 JSON 객체로 반환합니다.
     */
    get: async () => {
      return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === "undefined") {
          return reject(
            new Error("Tampermonkey의 GM_xmlhttpRequest 권한이 필요합니다."),
          );
        }

        GM_xmlhttpRequest({
          method: "GET",
          url: apiUrl,
          headers: headers,
          onload: (res) => {
            if (res.status === 200) {
              const data = JSON.parse(res.responseText);
              const file = data.files[fileName];
              if (!file)
                return reject(
                  new Error(`파일을 찾을 수 없습니다: ${fileName}`),
                );
              resolve(JSON.parse(file.content));
            } else {
              reject(new Error(`Gist 불러오기 실패: ${res.status}`));
            }
          },
          onerror: reject,
        });
      });
    },

    /**
     * 객체를 JSON 문자열로 변환하여 Gist에 저장합니다.
     * @param {Object} value - 저장할 객체
     */
    set: async (value) => {
      return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === "undefined") {
          return reject(
            new Error("Tampermonkey의 GM_xmlhttpRequest 권한이 필요합니다."),
          );
        }

        const body = JSON.stringify({
          files: {
            [fileName]: {
              content: JSON.stringify(value, null, 2), // 요청하신 포맷 (JSON.stringify(value, null, 2))
            },
          },
        });

        GM_xmlhttpRequest({
          method: "PATCH",
          url: apiUrl,
          headers: headers,
          data: body,
          onload: (res) => {
            if (res.status === 200) {
              resolve(JSON.parse(res.responseText));
            } else {
              reject(new Error(`Gist 업데이트 실패: ${res.status}`));
            }
          },
          onerror: reject,
        });
      });
    },
  };
}
