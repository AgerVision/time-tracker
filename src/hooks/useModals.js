import { useState } from 'react';

export const useModals = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingInterval, setEditingInterval] = useState(null);
  const [intervalToDelete, setIntervalToDelete] = useState(null);
  const [categoryModalConfig, setCategoryModalConfig] = useState({
    onSave: null,
    addNewOnOpen: false,
    directAdd: false,
    autoCloseOnSave: true
  });

  const openEditModal = (interval, index) => {
    setEditingInterval(index !== undefined ? { ...interval, index } : interval);
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

  const openCategoryModal = (onSave, addNewOnOpen = false, directAdd = false, autoCloseOnSave = true) => {
    setCategoryModalConfig({ onSave, addNewOnOpen, directAdd, autoCloseOnSave });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryModalConfig({
      onSave: null,
      addNewOnOpen: false,
      directAdd: false,
      autoCloseOnSave: true
    });
  };

  return {
    isEditModalOpen,
    isDeleteModalOpen,
    isCategoryModalOpen,
    editingInterval,
    intervalToDelete,
    categoryModalConfig,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openCategoryModal,
    closeCategoryModal,
    setEditingInterval,
  };
};