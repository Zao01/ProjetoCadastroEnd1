package com.desafio.sustentacao.service;

import com.desafio.sustentacao.model.Item;
import com.desafio.sustentacao.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    @Autowired
    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> listarTodos() {
        return itemRepository.findAll();
    }

    @SuppressWarnings("null")
    public Optional<Item> buscarPorId(Long id) {
        return itemRepository.findById(id);
    }

    @SuppressWarnings("null")
    public Item salvar(Item item) {
        return itemRepository.save(item);
    }

    @SuppressWarnings("null")
    public Item atualizar(Long id, Item itemAtualizado) {
        return itemRepository.findById(id)
                .map(item -> {
                    item.setNome(itemAtualizado.getNome());
                    item.setDescricao(itemAtualizado.getDescricao());
                    if (itemAtualizado.getStatus() != null) {
                        item.setStatus(itemAtualizado.getStatus());
                    }
                    return itemRepository.save(item);
                })
                .orElseThrow(() -> new RuntimeException("Item não encontrado com o id: " + id));
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        itemRepository.deleteById(id);
    }
}
