using System;

namespace Apis.DTOs
{
    public class UpdateBookDTO
    {
        public string? Title { get; set; }
        public string? Author { get; set; }
        public int? PublishedYear { get; set; }
        public string? Genre { get; set; }
        public decimal? Price { get; set; }
        public string? Content { get; set; }
        public string? Username { get; set; }
        public string? Image { get; set; }
        public string? PdfUrl { get; set; }
    }
}
