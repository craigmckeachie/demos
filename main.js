function ID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function translateStatusToErrorMessage(status) {
  switch (status) {
    case 401:
      return 'Please login again.';
    case 403:
      return 'You do not have permission to view the items.';
    default:
      return 'There was an error retrieving the items. Please try again.';
  }
}

//pass translate in to make this more flexible
function checkStatus(response) {
  if (response.ok) {
    return response;
  } else {
    const httpErrorInfo = {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    };
    console.log(
      `logging http details for debugging: ${JSON.stringify(httpErrorInfo)}`
    );

    let errorMessage = translateStatusToErrorMessage(httpErrorInfo.status);
    throw new Error(errorMessage);
  }
}

function parseJSON(response) {
  return response.json();
}

class Item {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

const baseUrl = 'http://localhost:3000';
const url = `${baseUrl}/items`;

// API ----------
const itemAPI = {
  getAll(page = 1, limit = 100) {
    return fetch(`${url}?_page=${page}&_limit=${limit}`)
      .then(checkStatus)
      .then(parseJSON)
      .catch((error) => {
        let errorMessage = translateStatusToErrorMessage(error);
        throw new Error(errorMessage);
      });
  },

  add(item) {
    return fetch(`${url}`, {
      method: 'POST',
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  update(item) {
    return fetch(`${url}/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  delete(id) {
    return fetch(`${url}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then(parseJSON);
  },
};

function List(props) {
  const { items, onRemove, onUpdate, loading, error } = props;
  const [editingItem, setEditingItem] = React.useState(null);

  const handleEditClick = (item) => {
    setEditingItem(item);
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>{error}</div>;
  } else {
    return (
      <ul>
        {items?.map((item) => (
          <li key={item.id}>
            {item === editingItem ? (
              <Form item={item} onSubmit={onUpdate} onCancel={handleCancel} />
            ) : (
              <p>
                <span>{item.name}</span>
                <button onClick={() => handleEditClick(item)}>Edit</button>
                <button onClick={() => onRemove(item)}>Remove</button>
              </p>
            )}
          </li>
        ))}
      </ul>
    );
  }
}

function Form({ item, onSubmit, onCancel, buttonValue }) {
  const [inputValue, setInputValue] = React.useState(item.name || '');

  const handleChange = (event) => {
    event.preventDefault();
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const submittedItem = {
      id: item ? item.id : ID(),
      name: inputValue,
    };

    onSubmit(submittedItem);
    setInputValue('');
  };

  const handleCancel = (event) => {
    event.preventDefault();
    onCancel();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input value={inputValue} onChange={handleChange} />
      <button>{buttonValue || 'Save'}</button>
      {onCancel && (
        <a href="#" onClick={handleCancel}>
          cancel
        </a>
      )}
    </form>
  );
}

function Container() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(undefined);

  React.useEffect(() => {
    setLoading(true);
    itemAPI
      .getAll(1)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const addItem = (item) => {
    itemAPI
      .add(item)
      .then((newItem) => {
        setItems([...items, newItem]);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const updateItem = (updatedItem) => {
    itemAPI
      .update(updatedItem)
      .then((data) => {
        let updatedItems = items.map((item) => {
          return item.id === updatedItem.id
            ? Object.assign({}, item, data)
            : item;
        });
        setItems(updatedItems);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const removeItem = (removeThisItem) => {
    itemAPI
      .delete(removeThisItem.id)
      .then(() => {
        const filteredItems = items.filter(
          (item) => item.id != removeThisItem.id
        );
        setItems(filteredItems);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div>
      <Form item="" onSubmit={addItem} buttonValue="Add" />
      <List
        loading={loading}
        error={error}
        items={items}
        onRemove={removeItem}
        onUpdate={updateItem}
      />
    </div>
  );
}

function App() {
  return (
    <div>
      <Container />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
