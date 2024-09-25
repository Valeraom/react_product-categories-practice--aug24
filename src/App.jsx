/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const USER_VALUES = ['All', 'Roma', 'Anna', 'Max', 'John'];
const USER_DEFAULT_VALUE = USER_VALUES[0];

const CATEGORY_VALUES = [
  'Grocery',
  'Drinks',
  'Fruits',
  'Electronics',
  'Clothes',
];

const COLUMNS = ['ID', 'Product', 'Category', 'User'];

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    categoryItem => categoryItem.id === product.categoryId,
  );

  const user = usersFromServer.find(
    userItem => userItem.id === category.ownerId,
  );

  return {
    ...product,
    category,
    user,
  };
});

const getVisibleProducts = (
  inputProducts,
  { userFilter, nameFilter, selectedCategories, sorting },
) => {
  let preparedProducts = [...inputProducts];

  if (userFilter !== 'All') {
    preparedProducts = preparedProducts.filter(
      product => product.user.name === userFilter,
    );
  }

  const normalizedNameFilter = nameFilter.toLowerCase().trim();

  if (normalizedNameFilter) {
    preparedProducts = preparedProducts.filter(product => {
      const normalizedProduct = product.name.toLowerCase().trim();

      return normalizedProduct.includes(normalizedNameFilter);
    });
  }

  if (selectedCategories.length) {
    preparedProducts = preparedProducts.filter(
      product => selectedCategories.includes(product.category.title),
      // eslint-disable-next-line prettier/prettier
    );
  }

  if (sorting.column) {
    preparedProducts.sort((currentProduct, nextProduct) => {
      let currentValue;
      let nextValue;

      let comparison = 0;

      if (sorting.column === 'ID') {
        currentValue = currentProduct.id;
        nextValue = nextProduct.id;
      }

      if (sorting.column === 'Product') {
        currentValue = currentProduct.name;
        nextValue = nextProduct.name;
      }

      if (sorting.column === 'Category') {
        currentValue = currentProduct.category.title;
        nextValue = nextProduct.category.title;
      }

      if (sorting.column === 'User') {
        currentValue = currentProduct.user.name;
        nextValue = nextProduct.user.name;
      }

      if (typeof currentValue === 'string') {
        comparison = currentValue.localeCompare(nextValue);
      } else {
        comparison = currentValue - nextValue;
      }

      return sorting.order === 'asc' ? comparison : comparison * -1;
    });
  }

  return preparedProducts;
};

export const App = () => {
  const [userFilter, setUserFilter] = useState(USER_DEFAULT_VALUE);
  const [nameFilter, setNameFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sorting, setSorting] = useState({
    column: null,
    order: null,
  });

  const visibleProducts = getVisibleProducts(products, {
    userFilter,
    nameFilter,
    selectedCategories,
    sorting,
  });

  const handleResetFilters = () => {
    setUserFilter(USER_DEFAULT_VALUE);
    setNameFilter('');
  };

  const handleSetCategories = category => {
    const isSelected = selectedCategories.includes(category);

    if (!isSelected) {
      setSelectedCategories(currentState => [...currentState, category]);
    }

    if (isSelected) {
      setSelectedCategories(
        selectedCategories.filter(categoryItem => categoryItem !== category),
      );
    }
  };

  const handleSorting = column => {
    const isSelected = sorting.column === column;

    if (!isSelected) {
      setSorting({
        column,
        order: 'asc',
      });
    }

    if (isSelected && sorting.order === 'asc') {
      setSorting({
        column,
        order: 'des',
      });
    }

    if (isSelected && sorting.order === 'des') {
      setSorting({
        column: null,
        order: null,
      });
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>
            <p className="panel-tabs has-text-weight-bold">
              {USER_VALUES.map(user => (
                <a
                  key={user}
                  data-cy={user === 'All' ? 'FilterAllUsers' : 'FilterUser'}
                  href="#/"
                  className={cn({ 'is-active': user === userFilter })}
                  onClick={() => setUserFilter(user)}
                >
                  {user}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={nameFilter}
                  onChange={event => setNameFilter(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {nameFilter && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setNameFilter('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {CATEGORY_VALUES.map(category => (
                <a
                  key={category}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category),
                  })}
                  href="#/"
                  onClick={() => handleSetCategories(category)}
                >
                  {category}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleResetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {COLUMNS.map(column => (
                    <th key={column}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {column}
                        <a href="#/" onClick={() => handleSorting(column)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort':
                                  sorting.column === column && !sorting.column,
                                'fa-sort-up':
                                  sorting.column === column &&
                                  sorting.order === 'asc',
                                'fa-sort-down':
                                  sorting.column === column &&
                                  sorting.order === 'des',
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map(product => {
                  const {
                    id,
                    name: productName,
                    category: { icon, title },
                    user: { name: userName, sex },
                  } = product;

                  return (
                    <tr data-cy="Product" key={id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {id}
                      </td>

                      <td data-cy="ProductName">{productName}</td>
                      <td data-cy="ProductCategory">
                        {icon} - {title}
                      </td>

                      <td
                        data-cy="ProductUser"
                        className={cn({
                          'has-text-link': sex === 'm',
                          'has-text-danger': sex === 'f',
                        })}
                      >
                        {userName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
