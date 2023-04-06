import React, { useState } from "react";

interface Props {
  setFilters: Function;
}

interface FormData {
  person_filter: {
    [key: string]: Array<string>;
    birthday: Array<string>;
    deathday: Array<string>;
  };
  movie_filter: {
    [key: string]: Array<string> | Array<number>;
    release_date: Array<string>;
    budget: Array<number>;
  };
  tv_filter: {
    [key: string]: Array<string>;
    first_air_date: Array<string>;
  };
}
const initialFormData = {
  person_filter: {
    birthday: [],
    deathday: [],
  },
  movie_filter: {
    release_date: [],
    budget: [],
  },
  tv_filter: {
    first_air_date: [],
  },
};

function SearchSettings({ setFilters }: Props) {
  const [visible, setVisible] = useState(false);
  const [form_data, updateFormData] = useState<FormData>(initialFormData);

  const handleForm = (e: React.FormEvent) => {
    let exportForm = {
      person_filter: {},
      movie_filter: {},
      tv_filter: {},
    } as PathFilters;
    for (const key in form_data.movie_filter) {
      let data = form_data.movie_filter[key] as any;
      let isDate = false;
      for (const item of data) {
        if (item && item.toString().match(/-/g)?.length === 2) {
          isDate = true;
          break;
        }
      }
      if (isDate) {
        data = data.map((date: string) => {
          let test = new Date(date);
          if (test.toString() !== "Invalid Date") {
            return test;
          }
          return undefined;
        });
      } else {
        data = data.map((num: number) => {
          return Number(num);
        });
      }
      if (Array.isArray(data)) {
        if (
          !Number.isNaN(data[0]) &&
          !Number.isNaN(data[1]) &&
          data[0] &&
          data[1]
        ) {
          exportForm.movie_filter[`${key}_IN`] = data;
        } else if (!Number.isNaN(data[0]) && data[0]) {
          exportForm.movie_filter[`${key}_GTE`] = data[0];
        } else if (!Number.isNaN(data[1]) && data[1]) {
          exportForm.movie_filter[`${key}_LTE`] = data[1];
        }
      }
    }
    setFilters(exportForm);
    e.preventDefault();
  };
  const handleMovieChange = (e: any) => {
    let value = e.target.name.substr(
      0,
      e.target.name.lastIndexOf("_")
    ) as string;
    let data = form_data.movie_filter[value];
    if (value in form_data.movie_filter) {
      if (Array.isArray(data)) {
        if (e.target.name.includes("start") || e.target.name.includes("min")) {
          form_data.movie_filter = {
            ...form_data.movie_filter,
            [value]: [e.target.value, data[1]],
          };
        } else if (
          e.target.name.includes("end") ||
          e.target.name.includes("max")
        ) {
          form_data.movie_filter = {
            ...form_data.movie_filter,
            [value]: [data[0], e.target.value],
          };
        } else {
          form_data.movie_filter = {
            ...form_data.movie_filter,
            [value]: e.target.value,
          };
        }
      }
    }
    updateFormData({
      ...form_data,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {visible && (
        <div className="absolute left-0 right-0 ml-auto mr-auto w-1/4 bg-slate-400">
          <h1 className="text-4xl">Search Settings</h1>
          <form onSubmit={handleForm}>
            <div className="flex">
              <label htmlFor="release_date_start">Release Date:</label>
              <input
                type="date"
                name="release_date_start"
                value={form_data.movie_filter.release_date[0]}
                onChange={handleMovieChange}
              />
              <label htmlFor="release_date_end">-</label>
              <input
                type="date"
                name="release_date_end"
                value={form_data.movie_filter.release_date[1]}
                onChange={handleMovieChange}
              />
            </div>
            <div className="flex">
              <label htmlFor="budget_min">Budget Min:</label>
              <input
                type="number"
                name="budget_min"
                value={form_data.movie_filter.budget[0]}
                onChange={handleMovieChange}
              />
              <label htmlFor="budget_max">Max:</label>
              <input
                type="number"
                name="budget_max"
                value={form_data.movie_filter.budget[1]}
                onChange={handleMovieChange}
              />
            </div>
            <div className="flex justify-center gap-5">
              <button onClick={() => setVisible(false)}>Close</button>
              <button type="submit" onClick={handleForm}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}
      <button className="h-6 w-6" onClick={() => setVisible(true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
}

export default SearchSettings;
