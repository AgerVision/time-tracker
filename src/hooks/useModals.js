import { useState } from 'react';

export const useModals = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingInterval, setEditingInterval] = useState(null);
  const [intervalToDelete, setIntervalToDelete] = useState(null);

  const openEditModal = (interval, index) => {
    setEditingInterval({ ...interval, index });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingInterval(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (index) => {
    setIntervalToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIntervalToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  return {
    isEditModalOpen,
    isDeleteModalOpen,
    isCategoryModalOpen,
    editingInterval,
    intervalToDelete,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openCategoryModal,
    closeCategoryModal,
    setEditingInterval,
  };
};