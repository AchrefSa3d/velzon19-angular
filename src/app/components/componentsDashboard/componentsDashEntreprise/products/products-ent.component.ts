import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-products-ent',
  templateUrl: './products-ent.component.html',
  styleUrls: ['./products-ent.component.scss'],
  standalone: false
})
export class ProductsEntComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Vendeur' },
    { label: 'Mes Produits', active: true }
  ];

  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  searchTerm = '';
  filterStatus = 'tous';
  showForm = false;
  editMode = false;
  selectedProduct: any = null;
  productForm!: FormGroup;
  loading = true;
  saving = false;
  saveError = '';
  imagePreview = '';

  constructor(private fb: FormBuilder, private api: TijaraApiService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
    this.api.getCategories().subscribe({
      next: (data: any[]) => { this.categories = data; }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getMyProducts().subscribe({
      next: (data: any[]) => {
        this.products = data.map(p => ({
          id:             p.id,
          name:           p.name,
          category:       p.category_name || '—',
          categoryId:     p.category_id,
          price:          p.price,
          stock:          p.stock,
          status:         p.is_active ? 'actif' : 'inactif',
          approvalStatus: p.approval_status || 'pending',
          sales:          0,
          image:          p.image_url || null,
        }));
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; }
    });
  }

  initForm(p?: any) {
    this.productForm = this.fb.group({
      name:        [p?.name        || '', [Validators.required, Validators.minLength(3)]],
      category_id: [p?.categoryId  || '', Validators.required],
      price:       [p?.price       || '', [Validators.required, Validators.min(1)]],
      stock:       [p?.stock       ?? 0,  [Validators.required, Validators.min(0)]],
      status:      [p?.status      || 'actif'],
    });
  }

  get f() { return this.productForm.controls; }

  applyFilter() {
    let list = [...this.products];
    if (this.filterStatus !== 'tous') list = list.filter(p => p.status === this.filterStatus);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t));
    }
    this.filteredProducts = list;
  }

  openAdd() {
    this.editMode = false;
    this.selectedProduct = null;
    this.imagePreview = '';
    this.saveError = '';
    this.initForm();
    this.showForm = true;
  }

  openEdit(p: any) {
    this.editMode = true;
    this.selectedProduct = p;
    this.imagePreview = p.image || '';
    this.saveError = '';
    this.initForm(p);
    this.showForm = true;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop grande. Maximum 2 MB.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => { this.imagePreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  removeImage(): void { this.imagePreview = ''; }

  saveProduct() {
    if (this.productForm.invalid) return;
    const val = this.productForm.value;
    const payload = {
      name:        val.name,
      category_id: val.category_id ? parseInt(val.category_id) : null,
      price:       parseFloat(val.price),
      stock:       parseInt(val.stock),
      is_active:   val.status === 'actif' ? 1 : 0,
      image_url:   this.imagePreview || null,
    };

    this.saving   = true;
    this.saveError = '';

    if (this.editMode && this.selectedProduct) {
      this.api.updateProduct(this.selectedProduct.id, payload).subscribe({
        next: () => { this.saving = false; this.showForm = false; this.loadProducts(); },
        error: (err: any) => {
          this.saving = false;
          this.saveError = err?.error?.message || 'Erreur lors de la modification.';
        }
      });
    } else {
      this.api.createProduct(payload).subscribe({
        next: () => { this.saving = false; this.showForm = false; this.loadProducts(); },
        error: (err: any) => {
          this.saving = false;
          this.saveError = err?.error?.message || 'Erreur lors de l\'ajout. Vérifiez que le backend est démarré.';
        }
      });
    }
  }

  toggleStatus(p: any) {
    const newStatus = p.status === 'actif' ? 'inactif' : 'actif';
    this.api.updateProduct(p.id, { is_active: newStatus === 'actif' ? 1 : 0 }).subscribe({
      next: () => { p.status = newStatus; this.applyFilter(); }
    });
  }

  deleteProduct(id: number) {
    if (confirm('Supprimer ce produit ?')) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          this.applyFilter();
        }
      });
    }
  }

  get activeCount()   { return this.products.filter(p => p.status === 'actif').length; }
  get inactiveCount() { return this.products.filter(p => p.status === 'inactif').length; }
  get totalSales()    { return this.products.reduce((s, p) => s + (p.sales || 0), 0); }
}
