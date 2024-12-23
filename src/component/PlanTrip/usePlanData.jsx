import { useState, useEffect } from 'react';
import axios from 'axios';

const usePlanData = (regionId, currentPage, searchTerm, categoryFilter) => {
  const [locations, setLocations] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLocations = (reset = false) => {
    if (regionId) {
      axios
        .get('http://localhost:5050/api/locations/searchLocation', {
          params: {
            regionId,
            page: currentPage - 1,
            pageSize: 10,
            keyword: searchTerm,
            tagNames: categoryFilter === '전체' ? '' : categoryFilter,
          },
        })
        .then((response) => {
          const fetchedLocations = response.data.content;
          if (reset) {
            setLocations(fetchedLocations);
          } else {
            setLocations((prev) => [...prev, ...fetchedLocations]);
          }
          setTotalPages(response.data.totalPages);
        })
        .catch((error) => console.error('데이터 로드 실패:', error));
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [currentPage]);

  useEffect(() => {
    fetchLocations(true);
  }, [searchTerm, categoryFilter]);

  return { locations, totalPages, fetchLocations };
};

export default usePlanData;
