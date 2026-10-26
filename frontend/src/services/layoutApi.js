import api from "./api";

const layoutApi = {

  /**
   * ========================================================
   * Get Complete Layout
   * ========================================================
   */
  async getLayout() {
    try {
      const response = await api.get("/layout");

      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch layout:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to fetch layout.")
      );
    }
  },

  /**
   * ========================================================
   * Save Entire Layout
   * ========================================================
   */
  async saveLayout(payload) {
    try {
      const response = await api.post(
        "/layout/save",
        payload
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to save layout:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to save layout.")
      );
    }
  },

  /**
   * ========================================================
   * Update Single Layout Item
   * ========================================================
   */
  async updateLayoutItem(
    categoryId,
    item
  ) {
    try {
      const response = await api.put(
        `/layout/${categoryId}`,
        item
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to update layout item:",
        error
      );

      throw (
        error?.response?.data ||
        new Error(
          "Failed to update layout item."
        )
      );
    }
  },

  /**
   * ========================================================
   * Delete Single Layout Item
   * ========================================================
   */
  async deleteLayoutItem(
    categoryId
  ) {
    try {
      const response = await api.delete(
        `/layout/${categoryId}`
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to delete layout item:",
        error
      );

      throw (
        error?.response?.data ||
        new Error(
          "Failed to delete layout item."
        )
      );
    }
  },

  /**
   * ========================================================
   * Reset Entire Layout
   * ========================================================
   */
  async resetLayout() {
    try {
      const response = await api.delete(
        "/layout/reset/all"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to reset layout:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to reset layout.")
      );
    }
  },

  /**
   * ========================================================
   * Get Available Categories
   * ========================================================
   */
  async getAvailableCategories() {
    try {
      const response = await api.get(
        "/layout/available-categories"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      );

      throw (
        error?.response?.data ||
        new Error(
          "Failed to fetch categories."
        )
      );
    }
  },

  /**
 * ========================================================
 * Get All Store Paths
 * ========================================================
 */
  async getPaths() {
    try {
      const response = await api.get("/layout/paths");

      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch store paths:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to fetch store paths.")
      );
    }
  },

  /**
   * ========================================================
   * Create Store Path
   * ========================================================
   */
  async createPath(path) {
    try {
      const response = await api.post(
        "/layout/paths",
        path
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to create path:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to create path.")
      );
    }
  },

  /**
   * ========================================================
   * Update Store Path
   * ========================================================
   */
  async updatePath(pathId, path) {
    try {
      const response = await api.put(
        `/layout/paths/${pathId}`,
        path
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to update path:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to update path.")
      );
    }
  },

  /**
   * ========================================================
   * Delete Store Path
   * ========================================================
   */
  async deletePath(pathId) {
    try {
      const response = await api.delete(
        `/layout/paths/${pathId}`
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to delete path:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to delete path.")
      );
    }
  },

  /**
   * ========================================================
   * Reset All Store Paths
   * ========================================================
   */
  async resetPaths() {
    try {
      const response = await api.delete(
        "/layout/paths/reset/all"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to reset paths:",
        error
      );

      throw (
        error?.response?.data ||
        new Error("Failed to reset paths.")
      );
    }
  },


  /**
 * ========================================================
 * Load Complete Store Layout
 * ========================================================
 *
 * Fetches shelves and paths together.
 * Useful when opening the layout editor.
 * ========================================================
 */
  async getCompleteLayout() {
    try {
      const [layout, paths] = await Promise.all([
        this.getLayout(),
        this.getPaths(),
      ]);

      return {
        layout,
        paths,
      };
    } catch (error) {
      console.error(
        "Failed to load complete store layout:",
        error
      );

      throw error;
    }
  },
};

export default layoutApi;