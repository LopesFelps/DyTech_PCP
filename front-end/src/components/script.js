// Alternar Menu Mobile
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Rolagem suave para links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        // Fecha o menu mobile se estiver aberto
        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Botão "Voltar ao Topo"
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.remove('opacity-0', 'invisible');
        backToTopButton.classList.add('opacity-100', 'visible');
    } else {
        backToTopButton.classList.remove('opacity-100', 'visible');
        backToTopButton.classList.add('opacity-0', 'invisible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Envio de formulário (sem backend)
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtém os valores do formulário
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Aqui normalmente você enviaria os dados para um servidor
    // Para este demo, apenas mostramos um alerta
    alert(`Obrigado, ${name}! Sua mensagem sobre "${subject}" foi recebida. Entraremos em contato em breve pelo e-mail ${email}.`);

    // Reseta o formulário
    contactForm.reset();
});

// Adiciona classe de animação ao rolar para os elementos
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-fade-in-up');

    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;

        if (elementPosition < screenPosition) {
            element.classList.add('animate-fade-in-up');
        
        }

        // Formulário de Orçamento (demo sem backend)
const orcamentoForm = document.getElementById('orcamento-form');
if (orcamentoForm) {
  orcamentoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(orcamentoForm).entries());
    alert(`Orçamento enviado!\nProduto: ${data.produto}\nServiço: ${data.servico}\nQuantidade: ${data.quantidade}`);
    orcamentoForm.reset();
  });
  // abre/fecha ao clicar no botão
  servicoBtn.addEventListener('click', () => toggleDropdown());

  // seleciona uma opção
  servicoDropdown.querySelectorAll('button[data-value]').forEach((opt) => {
    opt.addEventListener('click', () => {
      servicoInput.value = opt.dataset.value;
      toggleDropdown(false);
      servicoInput.focus();
    });
  });

  // fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!servicoDropdown.contains(e.target) && !servicoBtn.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  // acessibilidade via teclado
  servicoBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(true);
    }
  });

  servicoDropdown.addEventListener('keydown', (e) => {
    const items = Array.from(servicoDropdown.querySelectorAll('button[data-value]'));
    const current = document.activeElement;
    const i = items.indexOf(current);

    if (e.key === 'Escape') {
      toggleDropdown(false);
      servicoBtn.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[Math.min(i + 1, items.length - 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[Math.max(i - 1, 0)]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      current?.click();
    }
  });
}


    });
};
// Adiciona a classe de animação ao rolar para os elementos
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);