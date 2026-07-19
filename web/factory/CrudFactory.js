/** @format */
import axios from "axios";
import { enqueueSnackbar } from "notistack";

export class CrudFactory {
  dateFormat = "MMMM Do YYYY hh:mm A";
  BASE_URL = "https://nexus-backend-bvu6.onrender.com/api/";

  getUrl = async (...segments) => {
    return segments.reduce((url, segment) => url + segment);
  };

  async get(url, data = {}, requestOptions = {}) {
    return this.send({
      method: "GET",
      url: `${this.BASE_URL}${url}`,
      data,
      ...requestOptions,
    });
  }

  async post(url, data = {}, requestOptions = {}) {
    return this.send({
      method: "POST",
      url: `${this.BASE_URL}${url}`,
      data,
      ...requestOptions,
    });
  }

  async create(url, data = {}, requestOptions = {}) {
    return this.send({
      method: "POST",
      url: `${this.BASE_URL}create/${url}`,
      data,
      ...requestOptions,
    });
  }

  async retrieve(url, data = {}, requestOptions = {}) {
    return this.send({
      method: "GET",
      url: `${this.BASE_URL}retrieve/${url}`,
      data,
      ...requestOptions,
    });
  }

  async update(url, data = {}, requestOptions = {}) {
    return this.send({
      method: "PUT",
      url: `${this.BASE_URL}update/${url}`,
      data,
      ...requestOptions,
    });
  }

  async delete(url, data = {}, requestOptions = {}) {
    return this.send({
      method: "DELETE",
      url: `${this.BASE_URL}delete/${url}`,
      data,
      ...requestOptions,
    });
  }

  async notify({ message, type }) {
    if (message) {
      console.log(message, "message", type);
      // CustomToast(type, message)
      enqueueSnackbar(message, {
        variant: type,
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
  }

  async send(requestOptions = {}) {
    const { url, data, method, notify = true } = requestOptions;

    const options = {
      ...requestOptions.ajaxOptions,
      method,
      data,
    };

    let fullUrl = await this.getUrl(url);

    options.headers = {
      ...options.headers,
      Accept: "application/json",
    };

    let res = {
      data: [],
      message: "",
      type: "error",
      errors: [],
    };
    const finalOptions = {
      ...options,
      url: fullUrl,
      withCredentials: true,
      validateStatus: (status) =>
        status === 200 || status === 401 || status === 400,
    };
    try {
      const response = await axios(finalOptions);

      if (response.status === 200) {
        res = response.data;
        const { type, message } = res;
        // ok
        console.log(type, message);
        if (options.method !== "GET" && notify) {
          this.notify({
            message,
            type,
          });
        }
      } else if (response.status === 401) {
        res = response.data;
        const { type, message } = res;
        // unauthorize
        this.notify({
          message: message,
          type: "error",
        });
      } else if (response.status === 400) {
        res = response.data;
        const { type, message } = res;
        // incomplete data
        this.notify({
          message: message,
          type: "error",
        });
      } else {
        throw new Error(`${response.status} : ${response.statusText}`);
      }
    } catch (e) {
      this.notify({
        message: "Something went wrong at our end.",
        type: "error",
      });
      throw e;
    } finally {
    }

    const { type } = res;

    if (type === "error") throw res;

    return res;
  }
}

export const $crud = new CrudFactory();
