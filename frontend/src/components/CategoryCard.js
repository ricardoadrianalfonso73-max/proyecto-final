

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import './CategoryCard.css';

const h = React.createElement;

function CategoryCard({ title, description, image, path }) {
  return h(Link, {
    to: path,
    className: 'category-card'
  },
    h('img', {
      src: image,
      alt: title,
      loading: 'lazy'
    }),
    h('div', { className: 'category-overlay' },
      h('div', null,
        h('h3', null, title),
        h('p', null, description)
      ),
      h('div', { className: 'category-arrow' },
        h(ArrowUpRight, { size: 23 })
      )
    )
  );
}

export default CategoryCard;
